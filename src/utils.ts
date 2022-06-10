import { existsSync, lstatSync, mkdirSync as emkdirSync } from "fs-extra";

export function mkdirSync(p: string) {
  if (existsSync(p) && lstatSync(p).isDirectory()) {
    return;
  }
  emkdirSync(p);
}

export function safeSetEnv(k: string, v: string, f = false) {
  if (v && !f) {
    process.env[k] = v;
  }
}
