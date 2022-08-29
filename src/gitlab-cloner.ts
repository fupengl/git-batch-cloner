#!/usr/bin/env node

import { resolve, join } from "node:path";
import { pTry } from "@planjs/utils";
import chalk from "chalk";

import setupENV from "./env.js";
import argv from "./argv.js";
import { mkdirSync, safeSetEnv } from "./utils.js";
import cloner from "./cloner.js";
import {
  getAllAuthorizedProjectList,
  getGroupProjectList,
} from "./services/gitlab.js";

async function main() {
  const args = argv();
  setupENV({
    path: args.config,
  });

  // set proceee.env
  safeSetEnv("GITLAB_URL", args.url);
  safeSetEnv("GITLAB_TOKEN", args.token);

  const cwd = resolve(
    join(
      process.cwd(),
      args.output ||
        process.env.GITLAB_OUTPUT ||
        process.env.OUTPUT ||
        "workspace"
    )
  );

  const groupListStr: string =
    args?.groupIds ||
    process.env.GITLAB_GROUP_ID_LIST! ||
    process.env.GROUP_ID_LIST!;
  let groupIdList = groupListStr
    ? groupListStr.split(/,|，|\s+/).map((v) => +v)
    : [];

  const projectList = groupListStr
    ? await getGroupProjectList(...groupIdList)
    : await getAllAuthorizedProjectList();

  if (projectList.length) {
    console.log(chalk.green(`Start cloning ${projectList.length} projects.`));
    mkdirSync(cwd);
  } else {
    console.log(chalk.yellow("No project fund."));
  }

  let i = 0;
  let clonedCount = 0;
  const errors: Error[] = [];
  for (const project of projectList) {
    i++;
    console.log(
      chalk.green(
        `------------ Start cloning ${project.name} ${i}${
          projectList.length + 1
        } ------------`
      )
    );
    const url = Boolean(args.useSSH)
      ? project.ssh_url_to_repo
      : project.http_url_to_repo;
    const [err, cloned] = await pTry(
      cloner(url, project.path_with_namespace, cwd)
    );
    if (err) {
      console.log(err);
      errors.push(err);
    }
    if (cloned) clonedCount++;
  }

  if (projectList.length) {
    console.log(
      chalk.green(
        `Complete the task, successfully clone ${clonedCount}, fail ${errors.length}, total ${projectList.length}`
      )
    );
  }
}

main().catch((err) => {
  console.log(err);
  process.exit(1);
});
