import { dexieDb } from "../database/database";
import { DexieConnectionRepository } from "./connectionRepository";
import { DexieActivityRepository } from "./activityRepository";
import { DexieObjectRepository } from "./objectRepository";
import { S3ObjectRepository } from "./s3ObjectRepository";
import { ObjectService } from "./objectService";
import { ActivityObjectService } from "./activityObjectService";
import { DexieShareRepository } from "./shareRepository";

export const connectionRepository = new DexieConnectionRepository(dexieDb);
export const activityRepository = new DexieActivityRepository(dexieDb);
export const objectRepository = new DexieObjectRepository(dexieDb);
export const shareRepository = new DexieShareRepository(dexieDb);

const remoteObjectRepository = new S3ObjectRepository();
const baseObjectService = new ObjectService(remoteObjectRepository, objectRepository);
export const objectService = new ActivityObjectService(baseObjectService, activityRepository);
