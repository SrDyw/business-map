import "dotenv/config";
import { prisma } from "./lib/db";

async function main() {
  const count = await prisma.business.findMany({ take: 1 });
  console.log("OK, rows:", count.length);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("FAILED:", e?.message ?? e);
  process.exit(1);
});