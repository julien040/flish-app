/*
 * File: \src\internal\instance\update.ts
 * Project: flish-app
 * Created Date: Wednesday December 8th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 08/12/2021 18:33
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
import { envVariables } from "../extension/types";
import { setConfig } from "../store";
import config from "../../config";
import { saveEnvVariable } from "./create";
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
) => {
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
      if (element.shouldBeEncrypted === true) {
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
