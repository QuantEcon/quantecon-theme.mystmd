// The static file server behind the `static-chrome` Playwright project
// (tests/visual/static-server.mjs) must serve only files under its root.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { createServer, get } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SERVER = fileURLToPath(new URL("../visual/static-server.mjs", import.meta.url));

let base, port, server, serverExited;

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

// Send the path exactly as written: no client-side normalisation.
function request(path) {
  return new Promise((resolve, reject) => {
    get({ host: "localhost", port, path }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    }).on("error", reject);
  });
}

before(async () => {
  base = await mkdtemp(join(tmpdir(), "static-server-"));
  // The served root, and a sibling whose name starts with the root's name.
  await mkdir(join(base, "site"));
  await writeFile(join(base, "site", "index.html"), "inside the root");
  await mkdir(join(base, "site-other"));
  await writeFile(join(base, "site-other", "secret.txt"), "outside the root");

  port = await freePort();
  server = spawn(process.execPath, [SERVER, join(base, "site"), String(port)], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  serverExited = new Promise((resolve) => server.once("exit", resolve));
  // Buffer stdout: the "serving" line can arrive split across chunks.
  let out = "";
  await new Promise((resolve, reject) => {
    server.stdout.on("data", (chunk) => {
      out += chunk;
      if (out.includes("serving")) resolve();
    });
    server.once("exit", (code) => reject(new Error(`server exited early (${code})`)));
  });
});

after(async () => {
  // Wait for the server to exit before removing its root, so no process is
  // left behind and nothing holds the directory open.
  if (server && server.exitCode === null && server.signalCode === null) {
    server.kill();
    await serverExited;
  }
  await rm(base, { recursive: true, force: true });
});

test("serves a file inside the root", async () => {
  const res = await request("/index.html");
  assert.equal(res.status, 200);
  assert.equal(res.body, "inside the root");
});

test("refuses a sibling directory whose name starts with the root's", async () => {
  const res = await request("/..%2fsite-other%2fsecret.txt");
  assert.equal(res.status, 403);
  assert.notEqual(res.body, "outside the root");
});

test("refuses a path that climbs out of the root", async () => {
  const res = await request("/..%2f..%2f..%2f..%2fetc%2fhostname");
  assert.equal(res.status, 403);
});

test("answers a malformed percent-escape with 400 and keeps serving", async () => {
  const res = await request("/%E0%A4%A");
  assert.equal(res.status, 400);
  const after = await request("/index.html");
  assert.equal(after.status, 200);
});
