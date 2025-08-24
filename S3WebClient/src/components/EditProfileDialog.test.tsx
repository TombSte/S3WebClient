import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditProfileDialog from './EditProfileDialog';
import type { UserProfile } from '../types/profile';

describe('EditProfileDialog', () => {
  const profile: UserProfile = {
    name: 'Mario',
    email: 'mario@example.com',
    role: 'Dev',
    company: 'ACME',
    location: 'Rome',
    joinDate: '2024',
    bio: 'bio',
    skills: ['js']
  };

  it('submits updated profile', async () => {
    const onSave = vi.fn();
    render(
      <EditProfileDialog open profile={profile} onClose={() => {}} onSave={onSave} />
    );

    await userEvent.type(screen.getByLabelText('Nome'), ' Rossi');
    await userEvent.clear(screen.getByLabelText('Competenze (separate da virgola)'));
    await userEvent.type(screen.getByLabelText('Competenze (separate da virgola)'), 'ts, react');
    await userEvent.click(screen.getByText('Salva'));

    expect(onSave).toHaveBeenCalledWith({
      ...profile,
      name: 'Mario Rossi',
      skills: ['ts', 'react']
    });
  });
});
