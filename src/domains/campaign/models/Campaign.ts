import { ValidationError, BusinessError } from '@/utils/DomainError';

// Value Objects
export class CampaignId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new ValidationError('Campaign ID cannot be empty');
    }
  }

  equals(other: CampaignId): boolean {
    return this.value === other.value;
  }
}

export class UserId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new ValidationError('User ID cannot be empty');
    }
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}

export enum CommissionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}

export enum Currency {
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP'
}

export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: Currency
  ) {
    if (amount < 0) {
      throw new ValidationError('Money amount cannot be negative');
    }
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new BusinessError('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new ValidationError('Factor cannot be negative');
    }
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }
}

export class Commission {
  constructor(
    public readonly percentage: number,
    public readonly type: CommissionType,
    public readonly currency: Currency,
    public readonly minAmount?: Money,
    public readonly maxAmount?: Money
  ) {
    this.validate();
  }

  public isValid(): boolean {
    try {
      this.validate();
      return true;
    } catch {
      return false;
    }
  }

  public calculateAmount(saleAmount: number): Money {
    if (saleAmount < 0) {
      throw new ValidationError('Sale amount cannot be negative');
    }

    let commissionAmount: number;

    switch (this.type) {
      case CommissionType.PERCENTAGE:
        commissionAmount = (saleAmount * this.percentage) / 100;
        break;
      case CommissionType.FIXED:
        commissionAmount = this.percentage; // In fixed type, percentage is actually the fixed amount
        break;
      default:
        throw new BusinessError('Unknown commission type');
    }

    const result = new Money(commissionAmount, this.currency);

    // Apply min/max constraints
    if (this.minAmount && result.amount < this.minAmount.amount) {
      return this.minAmount;
    }

    if (this.maxAmount && result.amount > this.maxAmount.amount) {
      return this.maxAmount;
    }

    return result;
  }

  private validate(): void {
    if (this.type === CommissionType.PERCENTAGE) {
      if (this.percentage < 0 || this.percentage > 100) {
        throw new ValidationError('Commission percentage must be between 0 and 100');
      }
    } else if (this.type === CommissionType.FIXED) {
      if (this.percentage < 0) {
        throw new ValidationError('Fixed commission amount must be positive');
      }
    }

    if (this.minAmount && this.maxAmount) {
      if (this.minAmount.amount > this.maxAmount.amount) {
        throw new ValidationError('Minimum commission cannot be greater than maximum commission');
      }
    }
  }
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Domain Events
export abstract class DomainEvent {
  public readonly occurredOn: Date = new Date();
  public readonly eventId: string = crypto.randomUUID();
  
  abstract get eventName(): string;
}

export class CampaignCreated extends DomainEvent {
  get eventName() { return 'CampaignCreated'; }
  
  constructor(
    public readonly campaignId: CampaignId,
    public readonly createdBy: UserId
  ) {
    super();
  }
}

export class CampaignActivated extends DomainEvent {
  get eventName() { return 'CampaignActivated'; }
  
  constructor(
    public readonly campaignId: CampaignId,
    public readonly activatedBy: UserId
  ) {
    super();
  }
}

export class CampaignCommissionUpdated extends DomainEvent {
  get eventName() { return 'CampaignCommissionUpdated'; }
  
  constructor(
    public readonly campaignId: CampaignId,
    public readonly oldCommission: Commission,
    public readonly newCommission: Commission,
    public readonly updatedBy: UserId
  ) {
    super();
  }
}

// Main Campaign Entity
export class Campaign {
  private _uncommittedEvents: DomainEvent[] = [];

  constructor(
    public readonly id: CampaignId,
    public readonly name: string,
    public readonly description: string,
    public readonly commission: Commission,
    public readonly status: CampaignStatus,
    public readonly ownerId: UserId,
    public readonly createdAt: Date,
    private readonly updatedAt: Date,
    public readonly trackingCode?: string,
    public readonly landingPageUrl?: string
  ) {
    this.validate();
  }

  // Factory method for creating new campaigns
  static create(
    name: string,
    description: string,
    commission: Commission,
    ownerId: UserId,
    trackingCode?: string,
    landingPageUrl?: string
  ): Campaign {
    const id = new CampaignId(crypto.randomUUID());
    const now = new Date();
    
    const campaign = new Campaign(
      id,
      name,
      description,
      commission,
      CampaignStatus.DRAFT,
      ownerId,
      now,
      now,
      trackingCode,
      landingPageUrl
    );

    campaign.addDomainEvent(new CampaignCreated(id, ownerId));
    return campaign;
  }

  public updateCommission(newCommission: Commission, updatedBy: UserId): Campaign {
    if (!this.canUpdateCommission()) {
      throw new BusinessError('Cannot update commission for non-draft campaign');
    }

    const updatedCampaign = new Campaign(
      this.id,
      this.name,
      this.description,
      newCommission,
      this.status,
      this.ownerId,
      this.createdAt,
      new Date(),
      this.trackingCode,
      this.landingPageUrl
    );

    updatedCampaign.addDomainEvent(
      new CampaignCommissionUpdated(this.id, this.commission, newCommission, updatedBy)
    );

    return updatedCampaign;
  }

  public activate(activatedBy: UserId): Campaign {
    if (!this.canActivate()) {
      throw new BusinessError('Campaign cannot be activated');
    }

    const activatedCampaign = new Campaign(
      this.id,
      this.name,
      this.description,
      this.commission,
      CampaignStatus.ACTIVE,
      this.ownerId,
      this.createdAt,
      new Date(),
      this.trackingCode,
      this.landingPageUrl
    );

    activatedCampaign.addDomainEvent(new CampaignActivated(this.id, activatedBy));
    return activatedCampaign;
  }

  public pause(): Campaign {
    if (!this.canPause()) {
      throw new BusinessError('Campaign cannot be paused');
    }

    return new Campaign(
      this.id,
      this.name,
      this.description,
      this.commission,
      CampaignStatus.PAUSED,
      this.ownerId,
      this.createdAt,
      new Date(),
      this.trackingCode,
      this.landingPageUrl
    );
  }

  public complete(): Campaign {
    if (!this.canComplete()) {
      throw new BusinessError('Campaign cannot be completed');
    }

    return new Campaign(
      this.id,
      this.name,
      this.description,
      this.commission,
      CampaignStatus.COMPLETED,
      this.ownerId,
      this.createdAt,
      new Date(),
      this.trackingCode,
      this.landingPageUrl
    );
  }

  public cancel(): Campaign {
    if (!this.canCancel()) {
      throw new BusinessError('Campaign cannot be cancelled');
    }

    return new Campaign(
      this.id,
      this.name,
      this.description,
      this.commission,
      CampaignStatus.CANCELLED,
      this.ownerId,
      this.createdAt,
      new Date(),
      this.trackingCode,
      this.landingPageUrl
    );
  }

  // Business rules
  private canUpdateCommission(): boolean {
    return this.status === CampaignStatus.DRAFT;
  }

  private canActivate(): boolean {
    return this.status === CampaignStatus.DRAFT && 
           this.commission.isValid() &&
           this.name.length >= 3;
  }

  private canPause(): boolean {
    return this.status === CampaignStatus.ACTIVE;
  }

  private canComplete(): boolean {
    return this.status === CampaignStatus.ACTIVE || this.status === CampaignStatus.PAUSED;
  }

  private canCancel(): boolean {
    return this.status !== CampaignStatus.COMPLETED && this.status !== CampaignStatus.CANCELLED;
  }

  public isActive(): boolean {
    return this.status === CampaignStatus.ACTIVE;
  }

  public isDraft(): boolean {
    return this.status === CampaignStatus.DRAFT;
  }

  public isCompleted(): boolean {
    return this.status === CampaignStatus.COMPLETED;
  }

  // Domain events management
  public getUncommittedEvents(): DomainEvent[] {
    return [...this._uncommittedEvents];
  }

  public markEventsAsCommitted(): void {
    this._uncommittedEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this._uncommittedEvents.push(event);
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 3) {
      throw new ValidationError('Campaign name must be at least 3 characters');
    }

    if (!this.description || this.description.trim().length === 0) {
      throw new ValidationError('Campaign description cannot be empty');
    }

    if (!this.commission.isValid()) {
      throw new ValidationError('Campaign commission is invalid');
    }

    if (this.landingPageUrl) {
      try {
        new URL(this.landingPageUrl);
      } catch {
        throw new ValidationError('Landing page URL is invalid');
      }
    }
  }

  // Equality
  public equals(other: Campaign): boolean {
    return this.id.equals(other.id);
  }

  // Serialization helper
  public toSnapshot() {
    return {
      id: this.id.value,
      name: this.name,
      description: this.description,
      commission: {
        percentage: this.commission.percentage,
        type: this.commission.type,
        currency: this.commission.currency
      },
      status: this.status,
      ownerId: this.ownerId.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      trackingCode: this.trackingCode,
      landingPageUrl: this.landingPageUrl
    };
  }
}