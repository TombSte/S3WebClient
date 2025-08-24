import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ObjectPropertiesDrawer from './ObjectPropertiesDrawer';
import type { S3ObjectEntity } from '../types/s3';
import { shareRepository } from '../repositories';

vi.mock('../repositories', () => ({
  shareRepository: {
    list: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('ObjectPropertiesDrawer', () => {
  const item: S3ObjectEntity = {
    connectionId: 'c1',
    key: 'docs/file.txt',
    parent: 'docs/',
    isFolder: 0,
    size: 1024,
    lastModified: new Date('2024-01-01'),
  };

  const list = shareRepository.list as unknown as vi.Mock;
  const remove = shareRepository.remove as unknown as vi.Mock;

  beforeEach(() => {
    list.mockReset();
    remove.mockReset();
  });

  it('loads and displays share links', async () => {
    list.mockResolvedValueOnce([
      { id: 1, url: 'http://link', expires: new Date().toISOString(), connectionId: 'c1', key: 'docs/file.txt' },
    ]);
    render(<ObjectPropertiesDrawer connectionId="c1" item={item} onClose={() => {}} />);
    await waitFor(() => expect(list).toHaveBeenCalled());
    expect(screen.getByText('Condivisioni')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'http://link' })).toBeInTheDocument();
  });

  it('copies and deletes a share link', async () => {
    list
      .mockResolvedValueOnce([
        { id: 1, url: 'http://link', expires: new Date().toISOString(), connectionId: 'c1', key: 'docs/file.txt' },
      ])
      .mockResolvedValueOnce([]);
    const writeText = vi.fn();
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ObjectPropertiesDrawer connectionId="c1" item={item} onClose={() => {}} />);
    await screen.findByRole('link', { name: 'http://link' });
    await userEvent.click(screen.getByTestId('ContentCopyIcon').closest('button')!);
    expect(writeText).toHaveBeenCalledWith('http://link');
    await userEvent.click(screen.getByTestId('DeleteIcon').closest('button')!);
    await waitFor(() => expect(remove).toHaveBeenCalledWith(1));
    await waitFor(() => expect(screen.queryByRole('link', { name: 'http://link' })).not.toBeInTheDocument());
  });
});
