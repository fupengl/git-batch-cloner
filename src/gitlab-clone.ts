#!/usr/bin/env node

import { getAccessProjectList } from "./services/gitlab.js";

async function main() {
  const projectList = await getAccessProjectList();
  console.log(projectList.map((v) => v.id));
}

main();
