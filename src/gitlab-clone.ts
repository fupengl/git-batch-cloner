#!/usr/bin/env node

import { resolve, join } from "path";
import { execaSync } from "execa";

import "./env.js";
import argv from "./argv.js";
import { getAllAuthorizedProjectList } from "./services/gitlab.js";

async function main() {
  const args = argv();

  const projectList = await getAllAuthorizedProjectList();
  for (const project of projectList) {
    execaSync(
      "git",
      ["clone", project.ssh_url_to_repo, project.path_with_namespace],
      {
        cwd: resolve(join(process.cwd(), args.output || "repo")),
        stdio: "inherit",
      }
    );
  }
}

main().catch((err) => {
  console.log(err);
  process.exit(1);
});
