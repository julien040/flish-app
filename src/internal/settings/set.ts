import Schema from "./schema";
import { setConfig } from "../store";

async function setSettings(
  id: string,
  value: string | number | boolean
): Promise<void> {
  const settings = Schema[id];
  if (!settings) {
    throw new Error("Settings does not exist");
  }
  if (typeof value !== settings.type) {
    throw new Error("Value is not the correct type");
  }
  await setConfig(`settings.${id}`, value);
}

export default setSettings;
