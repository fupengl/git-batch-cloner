import assert from "node:assert";
import got from "got";
import type { CancelableRequest, Response } from "got";
import { delay, retry } from "@planjs/utils";
import chalk from "chalk";

const TOKEN_KEY = "PRIVATE-TOKEN";

export type ProjectItem = {
  id: number;
  description: string;
  name: string;
  path: string;
  created_at: string;
  default_branch: string;
  web_url: string;
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  path_with_namespace: string;
  empty_repo: boolean;
  namespace?: {
    id: number;
    name: string;
    path: string;
    kind: string;
    full_path: string;
  };
};

/**
 * 获取所有有权限访问的项目
 * @returns {ProjectItem[]}
 * @see https://docs.gitlab.com/ee/api/projects.html#list-all-projects
 */
export async function getAllAuthorizedProjectList() {
  const params = getGlobalParams();
  assert(params.token, "Gitlab token is required.");
  const { projectList, total } = await getProjectList((page, per_page) =>
    got.get(`${params.url}/api/v4/projects`, {
      headers: { [TOKEN_KEY]: params.token },
      searchParams: { page, per_page },
    })
  );
  console.log(chalk.cyan(`[Gitlab] Successfully requested ${total} project.`));
  return projectList;
}

/**
 * 获取指定分组下的项目
 * @param groupIdList {string[]}
 * @returns {ProjectItem[]}
 */
export async function getGroupProjectList(...groupIdList: number[]) {
  let total = 0;
  const projectList: ProjectItem[] = [];
  const params = getGlobalParams();

  for (const groupId of groupIdList) {
    const { total: subTotal, projectList: list } = await getProjectList(
      (page, per_page) =>
        got.get(`${params.url}/api/v4/groups/${groupId}/projects`, {
          headers: { [TOKEN_KEY]: params.token },
          searchParams: { page, per_page, include_subgroups: true },
        })
    );
    total += subTotal;
    projectList.push(...list);
  }
  console.log(chalk.cyan(`[Gitlab] Successfully requested ${total} project.`));
  return projectList;
}

function getGlobalParams() {
  return {
    url: process.env.GITLAB_URL || process.env.URL || "https://gitlab.com",
    token: process.env.GITLAB_TOKEN || process.env.TOKEN,
  };
}

/**
 * 获取项目列表
 * 带有重试,遍历请求所有项目
 * @param services
 * @returns
 */
async function getProjectList(
  services: (
    page: number,
    per_page: number
  ) => CancelableRequest<Response<string>>
) {
  let page = 1;
  const per_page = 20;
  const projectList: ProjectItem[] = [];

  let total = 0;
  let totalPage;

  while (projectList.length === (page - 1) * per_page) {
    projectList.push(
      ...(await retry(
        async () => {
          const res = services(page, per_page);
          await res.then((rsp) => {
            totalPage = rsp.headers["x-total-pages"];
            total = +rsp.headers["x-total"]! || 0;
          });
          return await res.json<ProjectItem[]>();
        },
        { maxAttempts: 3, delayMs: 1000 }
      )())
    );
    await delay(100);
    console.log(
      chalk.cyan(`[Gitlab] Get page ${page}/${totalPage} successfully.`)
    );
    page++;
  }
  return {
    projectList,
    total,
  };
}
