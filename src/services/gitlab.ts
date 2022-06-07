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
  namespace?: {
    id: number;
    name: string;
    path: string;
    kind: string;
    full_path: string;
  };
};

// see https://docs.gitlab.com/ee/api/projects.html#list-all-projects
export async function getAccessProjectList() {
  let page = 1;
  const per_page = 50;
  const projectList: ProjectItem[] = [];

  while (projectList.length === (page - 1) * 50) {
    projectList.push(
      ...(await retry(
        () => {
          return got
            .get(`${process.env.GITLAB_URL}/api/v4/projects`, {
              headers: {
                [TOKEN_KEY]: process.env.GITLAB_TOKEN,
              },
              searchParams: {
                page,
                per_page,
              },
            })
            .json<ProjectItem[]>();
        },
        {
          maxAttempts: 3,
          delayMs: 1000,
        }
      )())
    );
    await delay(100);
    page++;
  }
  return projectList;
}
