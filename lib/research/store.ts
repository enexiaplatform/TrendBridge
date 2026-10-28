import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Run } from "./report";

export class LocalResearchStore {
  private db: DatabaseSync;
  constructor(filename: string) {
    this.db = new DatabaseSync(filename);
    this.db.exec("PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, request_key TEXT NOT NULL, created_at TEXT NOT NULL, document TEXT NOT NULL, UNIQUE(owner_id, request_key)); CREATE INDEX IF NOT EXISTS runs_owner ON runs(owner_id, created_at);");
  }
  get(owner: string, id: string): Run | null {
    const row = this.db.prepare("SELECT document FROM runs WHERE owner_id=? AND id=?").get(owner, id);
    return row ? JSON.parse(String(row.document)) : null;
  }
  list(owner: string): Run[] { return this.db.prepare("SELECT document FROM runs WHERE owner_id=? ORDER BY created_at DESC LIMIT 100").all(owner).map(r => JSON.parse(String(r.document))); }
  create(run: Run): Run {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const existing = this.db.prepare("SELECT document FROM runs WHERE owner_id=? AND request_key=?").get(run.ownerId, run.requestKey);
      if (existing) { this.db.exec("COMMIT"); return JSON.parse(String(existing.document)); }
      const since = new Date(Date.now() - 3600_000).toISOString();
      const count = this.db.prepare("SELECT count(*) AS n FROM runs WHERE owner_id=? AND created_at>?").get(run.ownerId, since);
      if (Number(count?.n) >= 10) throw new Error("RATE_LIMIT");
      this.db.prepare("INSERT INTO runs(id,owner_id,request_key,created_at,document) VALUES(?,?,?,?,?)").run(run.id,run.ownerId,run.requestKey,run.createdAt,JSON.stringify(run));
      this.db.exec("COMMIT"); return run;
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }
  save(run: Run, expectedUpdatedAt: string) {
    const result = this.db.prepare("UPDATE runs SET document=? WHERE id=? AND owner_id=? AND json_extract(document,'$.updatedAt')=?").run(JSON.stringify(run),run.id,run.ownerId,expectedUpdatedAt);
    if (Number(result.changes) !== 1) throw new Error("WRITE_CONFLICT");
  }
  close() { this.db.close(); }
}
let local: LocalResearchStore | undefined;
export function localResearchStore() {
  if (process.env.NODE_ENV === "production") throw new Error("Local development storage is disabled in production");
  if (!local) { const dir = join(process.cwd(), ".data"); mkdirSync(dir, { recursive: true }); local = new LocalResearchStore(join(dir, "research.sqlite")); }
  return local;
}
