import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MoveObjectDialog from './MoveObjectDialog';
import type { S3Connection } from '../types/s3';
import { objectService } from '../repositories';

vi.mock('../repositories', () => ({
  objectService: {
    fetchChildren: vi.fn(),
    move: vi.fn(),
  },
}));

describe('MoveObjectDialog', () => {
  const connection = { id: 'c1' } as S3Connection;
  const fetchChildren = objectService.fetchChildren as unknown as vi.Mock;
  const move = objectService.move as unknown as vi.Mock;

  beforeEach(() => {
    fetchChildren.mockReset();
    move.mockReset();
  });

  it('moves file to root when confirmed', async () => {
    fetchChildren.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    const onClose = vi.fn();
    const onMoved = vi.fn();
    render(
      <MoveObjectDialog
        open
        connection={connection}
        sourceKey="folder/file.txt"
        onClose={onClose}
        onMoved={onMoved}
      />
    );
    await waitFor(() => expect(fetchChildren).toHaveBeenCalled());
    await userEvent.click(screen.getByText('Sposta qui'));
    expect(move).toHaveBeenCalledWith(connection, 'folder/file.txt', 'file.txt');
    expect(onMoved).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
