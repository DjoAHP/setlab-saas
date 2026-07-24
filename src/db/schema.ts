import Dexie, { type EntityTable } from "dexie";
import type { Setlist } from "../types";

export class SetlabDB extends Dexie {
  setlists!: EntityTable<Setlist, "id">;

  constructor() {
    super("setlab");
    this.version(1).stores({
      setlists: "id, userId, updatedAt",
    });
  }
}

export const db = new SetlabDB();