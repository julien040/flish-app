import { getConfig } from "../store";
import { Instance } from "./types";
import { extension } from "../extension/types";
import { getPassword } from "keytar";
import config from "../../config";

/**
 * Get metadata about a specific instance
 * @param  {string} instanceID The unique id of the instance
 */
export const getInstance = async (
  instanceID: string
): Promise<{ instance: Instance; extension: extension }> => {
  const instance = await getConfig(`instances.${instanceID}`);
  if (!instance) {
    throw new Error(`Instance id ${instanceID} does not exist`);
  }
  const extensionID = instance.extensionID;
  const extension = await getConfig(`extensions.${extensionID}`);
  if (!extension) {
    throw new Error(`Extension id ${extensionID} does not exist`);
  }

  return { instance, extension };
};

// For typescript to work
type dictionnary = {
  [key: string]: unknown;
};

/** Return the env variables of an instance
 * @param  {string} instanceID The unique id of the instance
 */
export const getEnvVariableOfInstance = async (
  instanceID: string
): Promise<dictionnary> => {
  const { extension } = await getInstance(instanceID);
  const envVariable = {} as dictionnary;
  for (let index = 0; index < extension.envVariables.length; index++) {
    const element = extension.envVariables[index];
    if (element.needToBeEncrypted) {
      envVariable[`${element.name}`] = await getPassword(
        config.secureStoreAppName,
        `${instanceID}-${element.name}`
      );
    } else {
      envVariable[`${element.name}`] = await getConfig(
        `envVariable.${instanceID}.${element.name}`
      );
    }
  }
  return envVariable;
};
/**
 * Return an object containing all instances and their metadata
 */
export const getAllInstances = async (): Promise<Record<string, Instance>> => {
  const data: { [key: string]: Instance } = await getConfig("instances");
  if (!data) {
    return {};
  }
  return data;
};
