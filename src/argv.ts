import yargs from "yargs-parser";
import { safeSetEnv } from "./utils.js";

type Args = {
  url?: string;
  token?: string;
  output?: string;
  config?: string;
  useSSH?: boolean;
};

export default function () {
  const argv = yargs(process.argv) as yargs.Arguments & Args;
  safeSetEnv("URL", argv.url!);
  safeSetEnv("TOKEN", argv.token!);
  return argv;
}
