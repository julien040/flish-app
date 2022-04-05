import { getConfig } from "../internal/store";

async function getURLDevMode(): Promise<string> {
  const urlDevMode = await getConfig("urlDevMode");
  if (urlDevMode != null) {
    return urlDevMode;
  }
  return "http://localhost:3000/";
}
export { getURLDevMode };
