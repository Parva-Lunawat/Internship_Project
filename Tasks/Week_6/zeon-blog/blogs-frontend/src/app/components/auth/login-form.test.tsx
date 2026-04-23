import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginForm from './LoginForm';

const pushMock = vi.fn();
const dispatchMock = vi.fn();
const loginMock = vi.fn();
const setSessionMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => dispatchMock,
}));

vi.mock('@/src/lib/authClient', () => ({
  login: (...args: unknown[]) => loginMock(...args),
}));

vi.mock('@/src/lib/session', () => ({
  setSession: (...args: unknown[]) => setSessionMock(...args),
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    pushMock.mockReset();
    dispatchMock.mockReset();
    loginMock.mockReset();
    setSessionMock.mockReset();
    toastErrorMock.mockReset();
  });

  it('submits valid credentials and redirects authenticated user', async () => {
    loginMock.mockResolvedValueOnce({
      type: 'authenticated',
      user: {
        name: 'Parva',
        email: 'parva@example.com',
        avatar: null,
        role: 'writer',
        isProfileComplete: false,
      },
    });

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = document.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Log in' });

    await userEvent.type(emailInput, 'parva@example.com');
    await userEvent.type(passwordInput, 'Codal@123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'parva@example.com',
        password: 'Codal@123',
      });
      expect(setSessionMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  it('shows API error on failed login and does not redirect', async () => {
    loginMock.mockResolvedValueOnce({
      type: 'unauthenticated',
      error: 'Invalid Email or Password!',
    });

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = document.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement;

    await userEvent.type(emailInput, 'parva@example.com');
    await userEvent.type(passwordInput, 'Codal@123');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Invalid Email or Password!');
      expect(setSessionMock).not.toHaveBeenCalled();
      expect(pushMock).not.toHaveBeenCalled();
    });
  });
});
