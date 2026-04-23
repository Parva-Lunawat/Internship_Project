import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardLayout from './layout';

const pushMock = vi.fn();
const useAppSelectorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('../Redux/customStoreWrapper', () => ({
  useAppSelector: (...args: unknown[]) => useAppSelectorMock(...args),
}));

vi.mock('../components/layout/DashboardNav', () => ({
  default: () => <nav data-testid="dashboard-nav" />,
}));

describe('DashboardLayout', () => {
  beforeEach(() => {
    pushMock.mockReset();
    useAppSelectorMock.mockReset();
  });

  it('redirects to login when auth is hydrated but user is missing', async () => {
    const state = {
      auth: {
        user: null,
        hydrated: true,
      },
    };

    useAppSelectorMock.mockImplementation((selector: (state: any) => any) =>
      selector(state),
    );

    render(
      <DashboardLayout>
        <div>Protected content</div>
      </DashboardLayout>,
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders dashboard content when authenticated user is present', async () => {
    const state = {
      auth: {
        user: {
          name: 'Parva',
          role: 'writer',
        },
        hydrated: true,
      },
    };

    useAppSelectorMock.mockImplementation((selector: (state: any) => any) =>
      selector(state),
    );

    render(
      <DashboardLayout>
        <div>Protected content</div>
      </DashboardLayout>,
    );

    expect(await screen.findByText('Protected content')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-nav')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
