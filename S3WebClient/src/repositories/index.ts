import { dexieDb } from "../database/database";
import { DexieConnectionRepository } from "./connectionRepository";
import { DexieActivityRepository } from "./activityRepository";
import { DexieObjectRepository } from "./objectRepository";
import { S3ObjectRepository } from "./s3ObjectRepository";
import { ObjectService } from "./objectService";

export const connectionRepository = new DexieConnectionRepository(dexieDb);
export const activityRepository = new DexieActivityRepository(dexieDb);
export const objectRepository = new DexieObjectRepository(dexieDb);

const remoteObjectRepository = new S3ObjectRepository();
export const objectService = new ObjectService(
  remoteObjectRepository,
  objectRepository
);
