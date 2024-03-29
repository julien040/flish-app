import { getAllInstances } from "../instance/read";
import { deleteConfig } from "../store";
import userDataPath from "../../utils/getUserDataPath";
import { join } from "path";
import { rm } from "fs/promises";
import captureEvent from "../analytics";

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
  try {
    const folderToDelete = join(userDataPath, "extensions", id);
    await rm(folderToDelete, { recursive: true });
  } catch (error) {
    // Do nothing
  }

  // Delete config
  await deleteConfig(`extensions.${id}`);
  captureEvent("Extension deleted", {
    extensionID: id,
  });
}

export default deleteExtension;
