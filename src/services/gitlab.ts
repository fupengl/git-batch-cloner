import got from "got";
import { delay, retry } from "@planjs/utils";

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
  namespace?: {
    id: number;
    name: string;
    path: string;
    kind: string;
    full_path: string;
  };
};

// see https://docs.gitlab.com/ee/api/projects.html#list-all-projects
export async function getAllAuthorizedProjectList() {
  let page = 1;
  const per_page = 20;
  const projectList: ProjectItem[] = [];

  let total;
  let totalPage;

  while (
    projectList.length === (page - 1) * per_page &&
    projectList.length < 10
  ) {
    projectList.push(
      ...(await retry(
        () => {
          const res = got.get(`${process.env.GITLAB_URL}/api/v4/projects`, {
            headers: {
              [TOKEN_KEY]: process.env.GITLAB_TOKEN,
            },
            searchParams: {
              page,
              per_page,
            },
          });
          res.then((rsp) => {
            totalPage = rsp.headers["x-total-pages"];
            total = rsp.headers["x-total"];
          });
          return res.json<ProjectItem[]>();
        },
        {
          maxAttempts: 3,
          delayMs: 1000,
        }
      )())
    );
    await delay(100);
    console.log(`[gitlab] Get page ${page}/${totalPage} successfully.`);
    page++;
  }
  console.log(`[gitlab] Successfully requested ${total} project.`);
  return projectList;
}
