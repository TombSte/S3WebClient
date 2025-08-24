import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadObjectDialog from './UploadObjectDialog';
import type { S3Connection } from '../types/s3';
import { objectService } from '../repositories';

vi.mock('../repositories', () => ({
  objectService: {
    fetchChildren: vi.fn(),
    upload: vi.fn(),
  },
}));

describe('UploadObjectDialog', () => {
  const connection = { id: 'c1' } as S3Connection;
  const fetchChildren = objectService.fetchChildren as unknown as vi.Mock;
  const upload = objectService.upload as unknown as vi.Mock;

  beforeEach(() => {
    fetchChildren.mockReset();
    upload.mockReset();
  });

  it('uploads selected file to chosen folder', async () => {
    fetchChildren.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    const onClose = vi.fn();
    const onUploaded = vi.fn();
    render(<UploadObjectDialog open connection={connection} onClose={onClose} onUploaded={onUploaded} />);
    await waitFor(() => expect(fetchChildren).toHaveBeenCalled());
    await userEvent.click(screen.getByText('/'));
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByText('Scegli file').querySelector('input') as HTMLInputElement;
    await userEvent.upload(input, file);
    await userEvent.click(screen.getByText('Carica'));
    expect(upload).toHaveBeenCalledWith(connection, 'test.txt', file);
    expect(onUploaded).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
