#!/usr/bin/env node

import { resolve, join } from "path";
import { execa } from "execa";
import { retry, pTry } from "@planjs/utils";
import chalk from "chalk";

import "./env.js";
import argv from "./argv.js";
import { mkdirSync, safeSetEnv } from "./utils.js";
import { getAllAuthorizedProjectList } from "./services/gitlab.js";

async function main() {
  const args = argv<{
    url: string;
    token: string;
    output: string;
  }>();

  safeSetEnv("GITLAB_URL", args.url);
  safeSetEnv("GITLAB_TOKEN", args.token);

  const cwd = resolve(join(process.cwd(), args.output || "repo"));
  mkdirSync(cwd);

  const projectList = await getAllAuthorizedProjectList();
  if (projectList.length) {
    console.log(chalk.green(`Start cloning ${projectList.length} projects.`));
  } else {
    console.log(chalk.yellow("No project fund."));
  }
  let i = 0;
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
    const [err] = await pTry(
      retry(
        () =>
          execa(
            "git",
            ["clone", project.ssh_url_to_repo, project.path_with_namespace],
            {
              cwd,
              stdio: "inherit",
            }
          ),
        {
          maxAttempts: 5,
          delayMs: 1000,
        }
      )()
    );
    if (err) {
      console.log(err);
      errors.push(err);
    }
  }
  if (projectList.length) {
    console.log(
      chalk.green(
        `Complete the task, successfully clone ${projectList.length}, fail ${errors.length}`
      )
    );
  }
}

main().catch((err) => {
  console.log(err);
  process.exit(1);
});
