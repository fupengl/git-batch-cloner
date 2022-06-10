import yargs from "yargs-parser";

export default function <T extends Record<string, any>>() {
  const argv = yargs(process.argv);
  return argv as unknown as T;
}
