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

    await userEvent.type(screen.getByLabelText('Name'), ' Rossi');
    await userEvent.clear(screen.getByLabelText('Skills (comma separated)'));
    await userEvent.type(screen.getByLabelText('Skills (comma separated)'), 'ts, react');
    await userEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledWith({
      ...profile,
      name: 'Mario Rossi',
      skills: ['ts', 'react']
    });
  });
});
