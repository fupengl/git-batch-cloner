#!/usr/bin/env node

import { resolve, join } from "path";
import { execa } from "execa";
import { retry, pTry } from "@planjs/utils";
import chalk from "chalk";

import setupENV from "./env.js";
import argv from "./argv.js";
import { mkdirSync, safeSetEnv } from "./utils.js";
import { getAllAuthorizedProjectList } from "./services/gitlab.js";

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

  const projectList = await getAllAuthorizedProjectList();
  if (projectList.length) {
    console.log(chalk.green(`Start cloning ${projectList.length} projects.`));
    mkdirSync(cwd);
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
            [
              "clone",
              args.useSSH ? project.ssh_url_to_repo : project.http_url_to_repo,
              project.path_with_namespace,
            ],
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
