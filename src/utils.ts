import { createRequire } from "node:module";
import { resolve, join } from "node:path";
import { execaSync } from "execa";
import type { SyncOptions } from "execa";

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

export function gitClone(url: string, target: string, args?: SyncOptions) {
  return execaSync("git", ["clone", url, target], {
    stdio: "inherit",
    ...args,
  });
}

export function checkGitRepoIsClean(opts?: SyncOptions) {
  return execaSync("git", ["status"], opts).stdout?.includes(
    "working tree clean"
  );
}

/**
 *
 * @param url 克隆仓库地址
 * @param target 克隆目标位置
 * @param cwd 执行目录
 * @returns {
 *    exitsRepo 是否存在仓库
 *    isCurrentRepo 本地仓库remote url不是目标仓库地址
 * }
 */
export function checkGitRepoExists(
  url: string,
  target: string,
  cwd = process.cwd()
) {
  const targetPath = resolve(cwd, target);
  const result = {
    exitsRepo: existsSync(join(targetPath, ".git/config")),
    isCurrentRepo: false,
  };

  try {
    if (result.exitsRepo) {
      result.isCurrentRepo = execaSync("git", ["remote", "-v"], {
        cwd: targetPath,
      }).stdout.includes(url);
    }
  } catch (e) {}
  return result;
}

export function fetchExistsRepo(cwd: string) {
  if (checkGitRepoIsClean({ cwd })) {
    execaSync("git", ["fetch", "-a"], { cwd });
  }
  // TODO 本地有更改
}
