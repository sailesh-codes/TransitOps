import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function loadEnvFile() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(currentDir, "../../../.env"),
    path.resolve(currentDir, "../../.env"),
  ];

  for (const filePath of candidates) {
    if (!existsSync(filePath)) continue;

    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      if (!key || process.env[key] !== undefined) continue;

      process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
    }
    return;
  }
}

loadEnvFile();

const [{ default: app }, { logger }] = await Promise.all([
  import("./app"),
  import("./lib/logger"),
]);

const rawPort = process.env["BACKEND_PORT"] ?? "3000";

if (!rawPort) {
  throw new Error(
    "BACKEND_PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
