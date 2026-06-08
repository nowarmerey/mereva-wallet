// Exports all current (SQLite) data to prisma/backup-sqlite.json so it can be
// re-imported into PostgreSQL after the multi-tenant upgrade.
// Run BEFORE switching the schema to Postgres:  node prisma/export-sqlite.js

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const data = {
    wallets: await prisma.wallet.findMany(),
    categories: await prisma.category.findMany(),
    transactions: await prisma.transaction.findMany(),
    bills: await prisma.bill.findMany(),
    billPayments: await prisma.billPayment.findMany(),
    subscriptions: await prisma.subscription.findMany(),
    goals: await prisma.goal.findMany(),
    settings: await prisma.settings.findMany(),
  };

  const out = path.join(__dirname, "backup-sqlite.json");
  fs.writeFileSync(out, JSON.stringify(data, null, 2));

  console.log("Exported to", out);
  for (const [k, v] of Object.entries(data)) {
    console.log(`  ${k}: ${v.length}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
