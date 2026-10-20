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
      "DELETE FROM users WHERE email LIKE '%@mimelux.test'",
    ],
    { env: { ...process.env, PGPASSWORD: "mimelux_dev" }, stdio: "inherit" },
  );
}
