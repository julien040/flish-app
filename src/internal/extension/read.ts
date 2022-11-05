import { extension } from "./types";
import { getConfig } from "../store";

/** Return an object specifiying extension properties
 * @param uuid The uuid of the extension
 *
 * Example :
 * ```typescript
 * const extension = await getExtension("uuid");
 * ```
 */
export const getExtension = async (uuid: string): Promise<extension> => {
  const data: extension = await getConfig(`extensions.${uuid}`);

  return data;
};

/** Return all extensions that are installed and appplication is aware of.
 * Data is an array of extension objects
 *
 * Example :
 * ```typescript
 * const extensions = await getAllExtensions();
 * ```
 */
export const getAllExtensions = async (): Promise<extension[]> => {
  const data = await getConfig(`extensions`);
  const AllExtensions: extension[] = [];
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const element = data[key];
      AllExtensions.push(element);
    }
  }

  return AllExtensions;
};
