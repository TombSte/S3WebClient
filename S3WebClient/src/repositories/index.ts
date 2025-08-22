import { dexieDb } from "../database/database";
import { DexieConnectionRepository } from "./connectionRepository";
import { DexieActivityRepository } from "./activityRepository";
import { DexieObjectRepository } from "./objectRepository";

export const connectionRepository = new DexieConnectionRepository(dexieDb);
export const activityRepository = new DexieActivityRepository(dexieDb);
export const objectRepository = new DexieObjectRepository(dexieDb);
