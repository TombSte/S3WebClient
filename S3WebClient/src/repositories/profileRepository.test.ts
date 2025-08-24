import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { S3WebClientDatabase } from '../database/database';
import { DexieProfileRepository } from './profileRepository';
import type { UserProfile } from '../types/profile';

let db: S3WebClientDatabase;
let repo: DexieProfileRepository;

const sampleProfile = (): UserProfile => ({
  name: 'Mario Rossi',
  email: 'mario.rossi@example.com',
  role: 'Developer',
  company: 'Acme',
  location: 'Rome',
  joinDate: '2024',
  bio: 'Test user',
  skills: ['React'],
});

describe('DexieProfileRepository', () => {
  beforeEach(() => {
    db = new S3WebClientDatabase();
    repo = new DexieProfileRepository(db);
  });

  afterEach(async () => {
    db.close();
    await db.delete();
  });

  it('saves and retrieves profile', async () => {
    await repo.save(sampleProfile());
    const profile = await repo.get();
    expect(profile?.name).toBe('Mario Rossi');
  });

  it('updates profile', async () => {
    await repo.save(sampleProfile());
    await repo.save({ ...sampleProfile(), name: 'Luigi' });
    const profile = await repo.get();
    expect(profile?.name).toBe('Luigi');
  });
});
