import Schema from "./schema";
import { logMessage } from "../logging/logging";
import { getConfig } from "../store";

async function getSettings(
  id: string,
  defaultValue?: string | number | boolean
): Promise<string | number | boolean> {
  const settings = Schema[id];
  if (!settings) {
    logMessage("error", `Settings ${id} does not exist`);
    return defaultValue;
  }
  const value = await getConfig(`settings.${id}`);
  if (value === null) {
    return settings.default;
  }
  return value;
}

export default getSettings;
