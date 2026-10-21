import { execFileSync } from "node:child_process";

export default function globalSetup() {
  execFileSync(
    "psql",
    [
      "-h",
      "127.0.0.1",
      "-U",
      "mimelux",
      "-d",
      "mimelux",
      "-c",
      `DELETE FROM commissions WHERE "conversionId" IN (
         SELECT id FROM conversions WHERE "purchaseId" IN (
           SELECT id FROM purchases WHERE "buyerId" IN (SELECT id FROM users WHERE email LIKE '%@mimelux.test')
         ) OR "attributionId" IN (
           SELECT id FROM attributions WHERE "fanId" IN (SELECT id FROM users WHERE email LIKE '%@mimelux.test')
         )
       );
       DELETE FROM conversions WHERE "purchaseId" IN (
         SELECT id FROM purchases WHERE "buyerId" IN (SELECT id FROM users WHERE email LIKE '%@mimelux.test')
       ) OR "attributionId" IN (
         SELECT id FROM attributions WHERE "fanId" IN (SELECT id FROM users WHERE email LIKE '%@mimelux.test')
       );
       DELETE FROM ledger_entries WHERE "purchaseId" IN (
         SELECT id FROM purchases WHERE "buyerId" IN (SELECT id FROM users WHERE email LIKE '%@mimelux.test')
       );
       DELETE FROM payment_events WHERE "purchaseId" IN (
         SELECT id FROM purchases WHERE "buyerId" IN (SELECT id FROM users WHERE email LIKE '%@mimelux.test')
       );
       DELETE FROM purchases WHERE "buyerId" IN (SELECT id FROM users WHERE email LIKE '%@mimelux.test');
       DELETE FROM subscriptions WHERE "fanId" IN (SELECT id FROM users WHERE email LIKE '%@mimelux.test');
       DELETE FROM attributions WHERE "fanId" IN (SELECT id FROM users WHERE email LIKE '%@mimelux.test');
       DELETE FROM users WHERE email LIKE '%@mimelux.test';`,
    ],
    { env: { ...process.env, PGPASSWORD: "mimelux_dev" }, stdio: "inherit" },
  );
}
