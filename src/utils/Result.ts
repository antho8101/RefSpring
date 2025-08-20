// Result pattern for better error handling
export class Result<T, E = Error> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E,
    private readonly _isSuccess: boolean = false
  ) {}

  static success<T>(value: T): Result<T> {
    return new Result(value, undefined, true);
  }

  static failure<E>(error: E): Result<never, E> {
    return new Result<never, E>(undefined, error, false);
  }

  static async fromPromise<T>(promise: Promise<T>): Promise<Result<T, Error>> {
    try {
      const value = await promise;
      return Result.success(value);
    } catch (error) {
      return Result.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  isSuccess(): boolean {
    return this._isSuccess;
  }

  isFailure(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value!;
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this._error!;
  }

  // Transform the value if success, otherwise return the same failure
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isSuccess()) {
      try {
        return Result.success(fn(this.value));
      } catch (error) {
        return Result.failure(error as E);
      }
    }
    return Result.failure(this.error);
  }

  // Transform the error if failure, otherwise return the same success
  mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this.isFailure()) {
      return Result.failure(fn(this.error));
    }
    return Result.success(this.value);
  }

  // Chain operations that return Results
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isSuccess()) {
      return fn(this.value);
    }
    return Result.failure(this.error);
  }

  // Provide a default value if failure
  getOrElse(defaultValue: T): T {
    return this.isSuccess() ? this.value : defaultValue;
  }

  // Execute a function if success
  onSuccess(fn: (value: T) => void): Result<T, E> {
    if (this.isSuccess()) {
      fn(this.value);
    }
    return this;
  }

  // Execute a function if failure
  onFailure(fn: (error: E) => void): Result<T, E> {
    if (this.isFailure()) {
      fn(this.error);
    }
    return this;
  }

  // Convert to Promise
  toPromise(): Promise<T> {
    if (this.isSuccess()) {
      return Promise.resolve(this.value);
    }
    return Promise.reject(this.error);
  }

  // Convert to nullable value
  toNullable(): T | null {
    return this.isSuccess() ? this.value : null;
  }
}

// Utility functions for working with multiple Results
export class Results {
  // Combine multiple Results - success only if all are success
  static combine<T extends readonly unknown[]>(
    ...results: { [K in keyof T]: Result<T[K], any> }
  ): Result<T, any> {
    const values = [] as unknown as T;
    
    for (let i = 0; i < results.length; i++) {
      if (results[i].isFailure()) {
        return Result.failure(results[i].error);
      }
      (values as any)[i] = results[i].value;
    }
    
    return Result.success(values);
  }

  // Get the first success or the last failure
  static firstSuccess<T, E>(results: Result<T, E>[]): Result<T, E> {
    if (results.length === 0) {
      throw new Error('Cannot get first success from empty array');
    }

    for (const result of results) {
      if (result.isSuccess()) {
        return result;
      }
    }

    return results[results.length - 1];
  }

  // Collect all successful values
  static collectSuccesses<T, E>(results: Result<T, E>[]): T[] {
    return results
      .filter(result => result.isSuccess())
      .map(result => result.value);
  }

  // Collect all failures
  static collectFailures<T, E>(results: Result<T, E>[]): E[] {
    return results
      .filter(result => result.isFailure())
      .map(result => result.error);
  }
}