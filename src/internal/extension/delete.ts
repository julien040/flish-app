import { getAllInstances } from "../instance/read";
import { deleteConfig } from "../store";
import getAppDataPath from "appdata-path";
import { join } from "path";
import { rmdir } from "fs/promises";
import captureEvent from "../analytics";

const userPath = getAppDataPath("flish");

/** An async function that delete an extension
 *
 * First, it checks if the extension is used by any instance. If it is, it throws an error and stop the process.
 * If not, it deletes the extension from the db and wipe the extension folder.
 * @param  {string} id The id of the extension to delete
 * @returns Promise
 */
async function deleteExtension(id: string): Promise<void> {
  const instances = await getAllInstances();
  // Check if there are any instances using this extension
  for (const key in instances) {
    if (Object.prototype.hasOwnProperty.call(instances, key)) {
      const element = instances[key];
      if (element.extensionID === id) {
        throw new Error(`Extension ${id} is used by instance ${element.name}`);
      }
    }
  }
  // Delete folder
  const folderToDelete = join(userPath, "extensions", id);
  await rmdir(folderToDelete, { recursive: true });

  // Delete config
  await deleteConfig(`extensions.${id}`);
  captureEvent("Extension deleted", {
    extensionID: id,
  });
}

export default deleteExtension;
