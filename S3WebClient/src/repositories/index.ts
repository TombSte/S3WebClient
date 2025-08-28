import { dexieDb } from "../database/database";
import { DexieConnectionRepository } from "./connectionRepository";
import { DexieActivityRepository } from "./activityRepository";
import { DexieObjectRepository } from "./objectRepository";
import { S3ObjectRepository } from "./s3ObjectRepository";
import { ObjectService } from "./objectService";
import { ActivityObjectService } from "./activityObjectService";
import { DexieShareRepository } from "./shareRepository";
import { DexieProfileRepository } from "./profileRepository";
import { DexieEnvironmentRepository } from "./environmentRepository";
import { AdminRepository } from "./adminRepository";

export const connectionRepository = new DexieConnectionRepository(dexieDb);
export const activityRepository = new DexieActivityRepository(dexieDb);
export const objectRepository = new DexieObjectRepository(dexieDb);
export const shareRepository = new DexieShareRepository(dexieDb);
export const profileRepository = new DexieProfileRepository(dexieDb);
export const environmentRepository = new DexieEnvironmentRepository(dexieDb);
export const adminRepository = new AdminRepository(dexieDb);

const remoteObjectRepository = new S3ObjectRepository();
const baseObjectService = new ObjectService(remoteObjectRepository, objectRepository);
export const objectService = new ActivityObjectService(baseObjectService, activityRepository);
