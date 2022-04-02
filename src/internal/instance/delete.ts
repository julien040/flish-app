import { deletePassword } from "keytar";
import { deleteConfig, getConfig } from "../store";
import config from "../../config";
import { getExtension } from "../extension/read";
import { Instance } from "./types";
import captureEvent from "../analytics";
import { session } from "electron";

/** An async function that delete an instance
 *
 * It removes the instance from the db, delete all env variables and delete all session data
 * @param  {string} id The id of the instance to delete
 * @returns Promise
 */
export const deleteInstance = async (id: string): Promise<void> => {
  const instance: Instance = await getConfig(`instances.${id}`);
  if (!instance) {
    throw new Error(`Instance ${id} does not exist`);
  }
  const extension = await getExtension(instance.extensionID);
  // Delete env variables
  for (let index = 0; index < extension.envVariables.length; index++) {
    const element = extension.envVariables[index];
    if (element.needToBeEncrypted === true) {
      await deletePassword(
        config.secureStoreAppName,
        `${instance.instanceID}-${element.name}`
      );
    } else {
      await deleteConfig(`envVariable.${instance.instanceID}.${element.name}`);
    }
  }
  const instanceSession = session.fromPartition(
    "persist:" + instance.instanceID
  );
  await instanceSession.clearStorageData();
  await deleteConfig(`instances.${id}`);
  captureEvent("Instance deleted", {
    extensionID: instance.extensionID,
    name: instance.name,
  });
};
