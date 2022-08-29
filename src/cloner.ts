import { resolve } from "node:path";
import { retry } from "@planjs/utils";
import chalk from "chalk";

import { gitClone, checkGitRepoExists, fetchExistsRepo } from "./utils.js";

async function cloner(url: string, target: string, cwd = process.cwd()) {
  const { isCurrentRepo, exitsRepo } = checkGitRepoExists(url, target, cwd);
  if (!exitsRepo) {
    await retry(() => Promise.resolve(gitClone(url, target, { cwd })), {
      maxAttempts: 5,
      delayMs: 1000,
    })();
    return true;
  } else {
    if (isCurrentRepo) {
      console.log(chalk.yellow(`[INFO] "${target}" already exists.`));
      const targetPath = resolve(cwd, target);
      fetchExistsRepo(targetPath);
    } else {
      console.log(
        chalk.red(`[ERROR] "${target}" already exists, but it is not the target path, you can do it manually.
  > rm -rf ${target}
  > git clone ${url} ${target}`)
      );
    }
    return false;
    // TODO 当git仓库存在,但是不是同一个仓库,需要特殊处理
  }
}

export default cloner;
