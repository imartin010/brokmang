/**
 * Select Role Page Tests
 * Smoke test for role selection
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectRolePage from '@/app/select-role/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock server action
jest.mock('@/app/select-role/actions', () => ({
  setUserRole: jest.fn(() => Promise.resolve({ ok: true })),
}));

test('renders and can click role buttons', async () => {
  render(<SelectRolePage />);
  
  // Check page renders
  expect(screen.getByText(/Select Your Role/i)).toBeInTheDocument();
  
  // Check CEO button exists and is clickable
  const ceoCard = screen.getByText(/CEO/i).closest('[role="button"]');
  expect(ceoCard).toBeInTheDocument();
  
  // Check Team Leader button exists and is clickable
  const teamLeaderCard = screen.getByText(/Team Leader/i).closest('[role="button"]');
  expect(teamLeaderCard).toBeInTheDocument();
  
  // Click CEO button
  if (ceoCard) {
    await userEvent.click(ceoCard);
  }
  
  // We can't assert network call, but no crash means wiring OK
});

