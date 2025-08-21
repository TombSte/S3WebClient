import { dexieDb } from "../database/database";
import { DexieConnectionRepository } from "./connectionRepository";
import { DexieActivityRepository } from "./activityRepository";

export const connectionRepository = new DexieConnectionRepository(dexieDb);
export const activityRepository = new DexieActivityRepository(dexieDb);
