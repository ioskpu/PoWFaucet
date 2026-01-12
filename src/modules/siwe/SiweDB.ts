import { FaucetDbDriver } from '../../db/FaucetDatabase.js';
import { FaucetModuleDB } from '../../db/FaucetModuleDB.js';
import { SQL } from '../../db/SQL.js';
import { FaucetSessionStoreData } from '../../session/FaucetSession.js';

export class SiweDB extends FaucetModuleDB {
  protected override latestSchemaVersion = 1;

  protected override async upgradeSchema(version: number): Promise<number> {
    switch (version) {
      case 0:
        version = 1;
        // Tabla para nonces pendientes
        await this.db.exec(SQL.driverSql({
          [FaucetDbDriver.SQLITE]: `
            CREATE TABLE "SiweNonces" (
              "Nonce" TEXT NOT NULL UNIQUE,
              "Address" TEXT,
              "Created" INTEGER NOT NULL,
              "Expires" INTEGER NOT NULL,
              PRIMARY KEY("Nonce")
            );`,
          [FaucetDbDriver.MYSQL]: `
            CREATE TABLE SiweNonces (
              Nonce VARCHAR(64) NOT NULL,
              Address VARCHAR(42),
              Created INT(11) NOT NULL,
              Expires INT(11) NOT NULL,
              PRIMARY KEY(Nonce)
            );`,
        }));
        await this.db.exec(SQL.driverSql({
          [FaucetDbDriver.SQLITE]: `CREATE INDEX "SiweNoncesExpires" ON "SiweNonces" ("Expires" ASC);`,
          [FaucetDbDriver.MYSQL]: `ALTER TABLE SiweNonces ADD INDEX SiweNoncesExpires (Expires);`,
        }));

        // Tabla para sesiones SIWE
        await this.db.exec(SQL.driverSql({
          [FaucetDbDriver.SQLITE]: `
            CREATE TABLE "SiweSessions" (
              "SessionId" TEXT NOT NULL UNIQUE,
              "Address" TEXT NOT NULL,
              PRIMARY KEY("SessionId")
            );`,
          [FaucetDbDriver.MYSQL]: `
            CREATE TABLE SiweSessions (
              SessionId CHAR(36) NOT NULL,
              Address VARCHAR(42) NOT NULL,
              PRIMARY KEY(SessionId)
            );`,
        }));
        await this.db.exec(SQL.driverSql({
          [FaucetDbDriver.SQLITE]: `CREATE INDEX "SiweSessionsAddress" ON "SiweSessions" ("Address" ASC);`,
          [FaucetDbDriver.MYSQL]: `ALTER TABLE SiweSessions ADD INDEX SiweSessionsAddress (Address);`,
        }));
    }
    return version;
  }

  public override async cleanStore(): Promise<void> {
    // Limpiar nonces expirados
    await this.db.run("DELETE FROM SiweNonces WHERE Expires < ?", [this.now()]);

    // Limpiar sesiones huérfanas
    let rows = await this.db.all([
      "SELECT SiweSessions.SessionId",
      "FROM SiweSessions",
      "LEFT JOIN Sessions ON Sessions.SessionId = SiweSessions.SessionId",
      "WHERE Sessions.SessionId IS NULL",
    ].join(" "));
    
    let dataIdx = 0;
    let promises: Promise<void>[] = [];
    while (dataIdx < rows.length) {
      let batchLen = Math.min(rows.length - dataIdx, 100);
      let dataBatch = rows.slice(dataIdx, dataIdx + batchLen);
      dataIdx += batchLen;
      promises.push(this.db.run(
        "DELETE FROM SiweSessions WHERE SessionId IN (" + dataBatch.map(() => "?").join(",") + ")",
        dataBatch.map((b: any) => b.SessionId) as any[]
      ).then());
    }
    await Promise.all(promises);
  }

  public async createNonce(nonce: string, expiresIn: number, address?: string): Promise<void> {
    const now = this.now();
    await this.db.run(
      SQL.driverSql({
        [FaucetDbDriver.SQLITE]: `INSERT INTO "SiweNonces" ("Nonce", "Address", "Created", "Expires") VALUES (?, ?, ?, ?)`,
        [FaucetDbDriver.MYSQL]: `INSERT INTO SiweNonces (Nonce, Address, Created, Expires) VALUES (?, ?, ?, ?)`,
      }),
      [nonce, address || null, now, now + expiresIn]
    );
  }

  public async verifyAndConsumeNonce(nonce: string): Promise<boolean> {
    const now = this.now();
    const row = await this.db.get(
      "SELECT * FROM SiweNonces WHERE Nonce = ? AND Expires > ?",
      [nonce, now]
    );

    if (!row) {
      return false;
    }

    await this.db.run("DELETE FROM SiweNonces WHERE Nonce = ?", [nonce]);
    return true;
  }

  public async cleanupExpiredNonces(): Promise<void> {
    await this.db.run("DELETE FROM SiweNonces WHERE Expires <= ?", [this.now()]);
  }

  public async setSiweSession(sessionId: string, address: string): Promise<void> {
    await this.db.run(
      SQL.driverSql({
        [FaucetDbDriver.SQLITE]: `INSERT OR REPLACE INTO "SiweSessions" ("SessionId", "Address") VALUES (?, ?)`,
        [FaucetDbDriver.MYSQL]: `REPLACE INTO SiweSessions (SessionId, Address) VALUES (?, ?)`,
      }),
      [sessionId, address.toLowerCase()]
    );
  }

  public getSiweSessions(address: string, duration: number, skipData?: boolean): Promise<FaucetSessionStoreData[]> {
    const now = this.now();
    return this.faucetStore.selectSessionsSql([
      "FROM SiweSessions",
      "INNER JOIN Sessions ON Sessions.SessionId = SiweSessions.SessionId",
      "WHERE SiweSessions.Address = ? AND Sessions.StartTime > ? AND Sessions.Status IN ('claimable','claiming','finished')",
    ].join(" "), [address.toLowerCase(), now - duration], skipData);
  }
}
