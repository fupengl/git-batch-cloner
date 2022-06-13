import yargs from "yargs-parser";
import { safeSetEnv } from "./utils.js";

type Args = {
  url?: string;
  token?: string;
  output?: string;
  config?: string;
  useSSH?: boolean;
  groupIds?: string;
};

export default function () {
  const argv = yargs(process.argv) as yargs.Arguments & Args;
  safeSetEnv("URL", argv.url!);
  safeSetEnv("TOKEN", argv.token!);
  safeSetEnv("GROUP_ID_LIST", argv.groupIds!);
  return argv;
}
