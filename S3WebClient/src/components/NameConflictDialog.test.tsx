import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NameConflictDialog from './NameConflictDialog';

describe('NameConflictDialog', () => {
  it('calls onResolve with replace', async () => {
    const onResolve = vi.fn();
    render(<NameConflictDialog open name="file.txt" onResolve={onResolve} />);
    await userEvent.click(screen.getByText('Replace'));
    expect(onResolve).toHaveBeenCalledWith('replace');
  });

  it('calls onResolve with keep-both', async () => {
    const onResolve = vi.fn();
    render(<NameConflictDialog open name="file.txt" onResolve={onResolve} />);
    await userEvent.click(screen.getByText('Keep both'));
    expect(onResolve).toHaveBeenCalledWith('keep-both');
  });

  it('calls onResolve with cancel', async () => {
    const onResolve = vi.fn();
    render(<NameConflictDialog open name="file.txt" onResolve={onResolve} />);
    await userEvent.click(screen.getByText('Cancel'));
    expect(onResolve).toHaveBeenCalledWith('cancel');
  });
});
