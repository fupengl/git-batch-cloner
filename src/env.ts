import path from "path";
import dotenv from "dotenv";
import type { DotenvConfigOptions } from "dotenv";

export default function (options?: DotenvConfigOptions) {
  return dotenv.config({
    ...options,
    path: options?.path || path.resolve(process.cwd(), ".env"),
  });
}
