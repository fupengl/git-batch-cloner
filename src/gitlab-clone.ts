#!/usr/bin/env node

import { resolve, join } from "path";
import { execa } from "execa";
import { retry, pTry } from "@planjs/utils";

import "./env.js";
import argv from "./argv.js";
import { getAllAuthorizedProjectList } from "./services/gitlab.js";

async function main() {
  const args = argv();

  const projectList = await getAllAuthorizedProjectList();
  for (const project of projectList) {
    await pTry(
      retry(
        () =>
          execa(
            "git",
            ["clone", project.ssh_url_to_repo, project.path_with_namespace],
            {
              cwd: resolve(join(process.cwd(), args.output || "repo")),
              stdio: "inherit",
            }
          ),
        {
          maxAttempts: 5,
          delayMs: 1000,
        }
      )()
    );
  }
}

main().catch((err) => {
  console.log(err);
  process.exit(1);
});
