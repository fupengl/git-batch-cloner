#!/usr/bin/env node

import "./env.js";
import { getAllAuthorizedProjectList } from "./services/gitlab.js";

async function main() {
  const projectList = await getAllAuthorizedProjectList();
  console.log(projectList.map((v) => v.id));
}

main().catch((err) => {
  console.log(err);
  process.exit(1);
});
