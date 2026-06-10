import { spawn } from "node:child_process";
import { resolve } from "node:path";

const viteBin = resolve("node_modules", "vite", "bin", "vite.js");

const children = [
  spawn(process.execPath, ["backend/index.js"], {
    stdio: "inherit",
    env: process.env,
  }),
  spawn(process.execPath, [viteBin, "--host", "127.0.0.1"], {
    stdio: "inherit",
    env: process.env,
  }),
];

function stopAll() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

for (const child of children) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      stopAll();
      process.exit(code);
    }
  });
}

process.on("SIGINT", () => {
  stopAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopAll();
  process.exit(0);
});
