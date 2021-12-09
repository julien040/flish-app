/*
 * File: \src\internal\instance\create.ts
 * Project: flish-app
 * Created Date: Wednesday December 8th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 08/12/2021 17:53
 * Modified By: Julien Cagniart
 * -----
 * Copyright (c) 2021 Julien - juliencagniart40@gmail.com
 * -----
 * _______ _ _      _                 _             
(_______) (_)    | |               | |            
 _____  | |_  ___| | _           _ | | ____ _   _ 
|  ___) | | |/___) || \         / || |/ _  ) | | |
| |     | | |___ | | | |   _   ( (_| ( (/ / \ V / 
|_|     |_|_(___/|_| |_|  (_)   \____|\____) \_/  
                                                   
 * Purpose of this file : 
 *  Link to documentation associated with this file : (empty) 
 */
import { envVariables } from "../extension/types"; // import type for environment variables
import { Instance } from "./types"; //import type for the instance object
import { nanoid } from "nanoid"; // To generate a unique ID
import { doesExtensionExist } from "../extension/utils/exists";
import { setConfig } from "../store";
import config from "../../config";
import keytar = require("keytar"); // To store the encrypted values

export const createInstance = async (
  extensionID: string,
  options: { name: string; keyboard?: string; envVariable?: envVariables[] }
) => {
  let { name, keyboard, envVariable } = options;
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
};
export async function saveEnvVariable(
  instanceID: string,
  envVariable: envVariables[]
) {
  for (let index = 0; index < envVariable.length; index++) {
    // For each env variable
    const element = envVariable[index];
    if (element.shouldBeEncrypted === true) {
      //If it should be encrypted, we set it in the keychain
      await keytar.setPassword(
        config.secureStoreAppName,
        `${instanceID}-${element.name}`,
        "empty"
      ); //Service name is defined in the config file. Key is the instanceID and the name of the env variable. We then set the value to an empty string
    } else {
      await setConfig(`envVariable.${instanceID}.${element.name}`, "");
    }
  }
}
