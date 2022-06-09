#!/usr/bin/env node

import { execaSync } from "execa";
import { join } from "path";

import "./env.js";
import { getAllAuthorizedProjectList } from "./services/gitlab.js";

async function main() {
  const projectList = await getAllAuthorizedProjectList();
  for (const project of projectList) {
    execaSync(
      "git",
      ["clone", project.ssh_url_to_repo, project.path_with_namespace],
      {
        cwd: join(process.cwd(), "repo"),
      }
    );
  }
}

main().catch((err) => {
  console.log(err);
  process.exit(1);
});
