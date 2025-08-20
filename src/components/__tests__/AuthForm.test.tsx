import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { AuthForm } from '@/components/AuthForm';

// Mock useAuth hook
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp, 
    signInWithGoogle: mockSignInWithGoogle,
    loading: false,
    error: null,
  }),
}));

describe('AuthForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form by default', () => {
    render(<AuthForm />);
    
    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('should switch to signup mode', () => {
    render(<AuthForm />);
    
    fireEvent.click(screen.getByText(/créer un compte/i));
    
    expect(screen.getByRole('heading', { name: /inscription/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    render(<AuthForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument();
    });
  });

  it('should validate password requirements', async () => {
    render(<AuthForm />);
    
    // Switch to signup mode
    fireEvent.click(screen.getByText(/créer un compte/i));
    
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/minimum 6 caractères/i)).toBeInTheDocument();
    });
  });

  it('should handle successful login', async () => {
    mockSignIn.mockResolvedValue({ user: { uid: 'test-uid' } });
    
    render(<AuthForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { 
      target: { value: 'password123' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should handle successful signup', async () => {
    mockSignUp.mockResolvedValue({ user: { uid: 'test-uid' } });
    
    render(<AuthForm />);
    
    // Switch to signup
    fireEvent.click(screen.getByText(/créer un compte/i));
    
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { 
      target: { value: 'password123' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));
    
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should handle Google sign in', async () => {
    mockSignInWithGoogle.mockResolvedValue({ user: { uid: 'test-uid' } });
    
    render(<AuthForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /continuer avec google/i }));
    
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });

  it('should display loading state', () => {
    vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp,
      signInWithGoogle: mockSignInWithGoogle,
      loading: true,
      error: null,
    });
    
    render(<AuthForm />);
    
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeDisabled();
    expect(screen.getByText(/connexion en cours/i)).toBeInTheDocument();
  });

  it('should display error messages', () => {
    vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp, 
      signInWithGoogle: mockSignInWithGoogle,
      loading: false,
      error: 'Email ou mot de passe incorrect',
    });
    
    render(<AuthForm />);
    
    expect(screen.getByText('Email ou mot de passe incorrect')).toBeInTheDocument();
  });

  it('should be accessible with proper form labels', () => {
    render(<AuthForm />);
    
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText(/mot de passe/i)).toHaveAttribute('type', 'password');
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('should handle form submission with Enter key', async () => {
    render(<AuthForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { 
      target: { value: 'password123' } 
    });
    fireEvent.keyDown(emailInput, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });
});