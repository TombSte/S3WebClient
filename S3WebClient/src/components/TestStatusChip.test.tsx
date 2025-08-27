import { render, screen } from '@testing-library/react';
import TestStatusChip from './TestStatusChip';

describe('TestStatusChip', () => {
  it('renders success label when status is success', () => {
    render(<TestStatusChip status="success" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('renders error label when status is failed', () => {
    render(<TestStatusChip status="failed" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders default label when status is untested', () => {
    render(<TestStatusChip status="untested" />);
    expect(screen.getByText('Not tested')).toBeInTheDocument();
  });
});
