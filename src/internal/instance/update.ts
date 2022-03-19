import { setConfig } from "../store";
import config from "../../config";
import { updateEnvVariables } from "./types";
import { setPassword } from "keytar";

/**
 * An async function that will update an instance in the config store.
 * @param instanceID : the instanceID of the instance
 * @param options : the options to update. All are optional.
 */
export const updateInstance = async (
  instanceID: string,
  options: {
    name?: string;
    keyboard?: string;
    envVariable?: updateEnvVariables[];
  }
): Promise<void> => {
  //If name should be changed
  const { name, keyboard, envVariable } = options;
  if (name != undefined) {
    setConfig(`instances.${instanceID}.name`, name);
  }
  //If keyboard should be changed
  if (keyboard != undefined) {
    setConfig(`instances.${instanceID}.keyboard`, keyboard);
  }
  //If envVariable should be changed
  if (envVariable != undefined) {
    for (let index = 0; index < envVariable.length; index++) {
      // For each env variable
      const element = envVariable[index];
      if (element.needToBeEncrypted === true) {
        //If it should be encrypted, we set it in the keychain
        await setPassword(
          config.secureStoreAppName,
          `${instanceID}-${element.name}`,
          element.value.toString()
        ); //Service name is defined in the config file. Key is the instanceID and the name of the env variable. We then set the value to an empty string
      } else {
        await setConfig(
          `envVariable.${instanceID}.${element.name}`,
          element.value
        );
      }
    }
  }
};
