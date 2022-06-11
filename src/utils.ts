import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { existsSync, lstatSync, mkdirSync: emkdirSync } = require("fs-extra");

export function mkdirSync(p: string) {
  if (existsSync(p) && lstatSync(p).isDirectory()) {
    return;
  }
  emkdirSync(p);
}

export function safeSetEnv(k: string, v?: string, f = false) {
  if (v && !f) {
    process.env[k] = v;
  }
}
