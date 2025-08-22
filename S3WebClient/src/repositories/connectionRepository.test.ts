import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DexieConnectionRepository } from './connectionRepository';
import { S3WebClientDatabase } from '../database/database';
import type { S3ConnectionForm } from '../types/s3';

let db: S3WebClientDatabase;
let repo: DexieConnectionRepository;

const sampleForm = (overrides: Partial<S3ConnectionForm> = {}): S3ConnectionForm => ({
  displayName: 'My Bucket',
  environment: 'dev',
  endpoint: 'https://example.com',
  region: 'us-east-1',
  accessKeyId: 'key',
  secretAccessKey: 'secret',
  bucketName: 'bucket',
  pathStyle: 1,
  metadata: {},
  ...overrides,
});

describe('DexieConnectionRepository', () => {
  beforeEach(() => {
    db = new S3WebClientDatabase();
    repo = new DexieConnectionRepository(db);
  });

  afterEach(async () => {
    db.close();
    await db.delete();
  });

  it('adds and retrieves a connection', async () => {
    const id = await repo.add(sampleForm());
    const conn = await repo.get(id);
    expect(conn).toBeDefined();
    expect(conn?.displayName).toBe('My Bucket');
  });

  it('updates a connection', async () => {
    const id = await repo.add(sampleForm());
    await repo.update(id, { displayName: 'New Name' });
    const conn = await repo.get(id);
    expect(conn?.displayName).toBe('New Name');
  });

  it('deletes a connection', async () => {
    const id = await repo.add(sampleForm());
    await repo.delete(id);
    const all = await repo.getAll();
    expect(all).toHaveLength(0);
  });

  it('searches connections by name', async () => {
    await repo.add(sampleForm());
    await repo.add(sampleForm({ displayName: 'Another', bucketName: 'other' }));
    const results = await repo.search('another');
    expect(results).toHaveLength(1);
    expect(results[0].displayName).toBe('Another');
  });

  it('filters connections by environment', async () => {
    await repo.add(sampleForm());
    await repo.add(sampleForm({ displayName: 'Prod', environment: 'prod', bucketName: 'prod-bucket' }));
    const devConnections = await repo.getByEnvironment('dev');
    expect(devConnections).toHaveLength(1);
    expect(devConnections[0].displayName).toBe('My Bucket');
  });
});
