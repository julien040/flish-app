import { Instance, updateEnvVariables } from "./types"; //import type for the instance object
import { nanoid } from "nanoid"; // To generate a unique ID
import { doesExtensionExist } from "../extension/utils/exists";
import { setConfig } from "../store";
import config from "../../config";
import keytar = require("keytar"); // To store the encrypted values
import captureEvent from "../analytics";

export const createInstance = async (
  extensionID: string,
  options: {
    name: string;
    keyboard?: string;
    envVariable?: updateEnvVariables[];
  }
): Promise<void> => {
  const { name } = options;
  let { keyboard, envVariable } = options;
  if (!keyboard) {
    keyboard = "";
  }
  if (!envVariable) {
    envVariable = [];
  }
  const instanceID = nanoid(); // generate a unique ID
  const instance: Instance = {
    instanceID,
    name,
    extensionID,
    keyboard: keyboard,
  }; //Define the instance object for a later use in config store.

  const exists = await doesExtensionExist(extensionID);
  if (exists == false) {
    throw new Error(`Extension id ${extensionID} does not exist`);
  } // Check if the extension exists in the config file

  await saveEnvVariable(instanceID, envVariable);
  await setConfig(`instances.${instanceID}`, instance); // We set the instance object in the config store
  captureEvent("Instance created", {
    extensionID: extensionID,
    name: name,
  });
};
export async function saveEnvVariable(
  instanceID: string,
  envVariable: updateEnvVariables[]
): Promise<void> {
  for (let index = 0; index < envVariable.length; index++) {
    // For each env variable
    const element = envVariable[index];
    element.value ??= ""; // If no value is set, set it to empty string
    element.value = element.value.toString();
    if (element.needToBeEncrypted === true) {
      //If it should be encrypted, we set it in the keychain
      await keytar.setPassword(
        config.secureStoreAppName,
        `${instanceID}-${element.name}`,
        element.value
      ); //Service name is defined in the config file. Key is the instanceID and the name of the env variable. We then set the value to an empty string
    } else {
      await setConfig(
        `envVariable.${instanceID}.${element.name}`,
        element.value
      );
    }
  }
}
