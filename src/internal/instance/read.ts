/*
 * File: \src\internal\instance\read.ts
 * Project: flish-app
 * Created Date: Wednesday December 8th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 11/12/2021 18:05
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
import { getConfig } from "../store";
import { Instance } from "./types";
import { extension } from "../extension/types";
import { getPassword } from "keytar";
import config from "../../config";

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
type dictionnary = {
  [key: string]: any;
};
export const getEnvVariableOfInstance = async (instanceID: string) => {
  const { extension } = await getInstance(instanceID);
  var envVariable = {} as dictionnary;
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

export const getAllInstances = async () => {
  const data: { [key: string]: Instance } = await getConfig("instances");
  if (!data) {
    return {};
  }
  return data;
};
