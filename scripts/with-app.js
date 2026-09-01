// @ts-check
/**
 * Starts the parent app's dev server, waits for it to respond, runs the given npm script
 * against it, then stops the server.
 *
 * Not using `start-server-and-test` here: its process-tree-kill step shells out to
 * `wmic.exe` on Windows, which Microsoft has removed from recent Windows 11 builds -
 * the server would start fine but teardown would crash. `taskkill /T` (Windows) and a
 * detached process-group kill (Linux/macOS) are the non-deprecated equivalents.
 */
const { spawn, execSync } = require("child_process");
const http = require("http");
const path = require("path");

const APP_DIR = path.resolve(__dirname, "..", "..");
const BASE_URL = process.env.CYPRESS_BASE_URL || `http://localhost:${process.env.CYPRESS_PORT || 3000}`;
const READY_TIMEOUT_MS = 120000;
const POLL_INTERVAL_MS = 1000;

function isWindows() {
  return process.platform === "win32";
}

function checkReady(url) {
  return new Promise((resolve) => {
    http
      .get(url, (res) => {
        res.resume();
        resolve(true);
      })
      .on("error", () => resolve(false));
  });
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await checkReady(url)) return true;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return false;
}

function runNpmScript(script, options) {
  const command = isWindows() ? "npm.cmd" : "npm";
  return spawn(command, ["run", script], { stdio: "inherit", ...options });
}

function killTree(child) {
  if (isWindows()) {
    try {
      execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: "ignore" });
    } catch {
      // Already exited - nothing to clean up.
    }
    return;
  }

  try {
    process.kill(-child.pid);
  } catch {
    // Already exited - nothing to clean up.
  }
}

async function main() {
  const testScript = process.argv[2];
  if (!testScript) {
    console.error("Usage: node scripts/with-app.js <npm-script-to-run>");
    process.exit(1);
  }

  const alreadyRunning = await checkReady(BASE_URL);
  const server = alreadyRunning
    ? null
    : runNpmScript("start-app", { cwd: __dirname + "/..", detached: !isWindows() });

  let exitCode = 1;
  try {
    const ready = alreadyRunning || (await waitForServer(BASE_URL, READY_TIMEOUT_MS));
    if (!ready) throw new Error(`App did not respond at ${BASE_URL} within ${READY_TIMEOUT_MS}ms`);

    exitCode = await new Promise((resolve) => {
      const test = runNpmScript(testScript, {});
      test.on("exit", (code) => resolve(code ?? 1));
    });
  } finally {
    if (server) killTree(server);
  }

  process.exit(exitCode);
}

main();
