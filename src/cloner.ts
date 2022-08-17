import { resolve } from "node:path";
import { retry } from "@planjs/utils";

import { gitClone, checkGitRepoExists, fetchExistsRepo } from "./utils.js";

async function cloner(url: string, target: string, cwd = process.cwd()) {
  const isExist = checkGitRepoExists(url, target, cwd);
  if (!isExist) {
    await retry(() => Promise.resolve(gitClone(url, target, { cwd })), {
      maxAttempts: 5,
      delayMs: 1000,
    })();
  } else {
    console.log(`"${target}" already exists.`);
    const targetPath = resolve(cwd, target);
    fetchExistsRepo(targetPath);
  }
}

export default cloner;
