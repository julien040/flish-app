/*
 * File: \src\internal\extension\read.ts
 * Project: flish-app
 * Created Date: Monday December 6th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 08/12/2021 13:25
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
                                                   
 * Purpose of this file : Get an extension or get all extensions
 *  Link to documentation associated with this file : (empty) 
 */
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
  let AllExtensions: extension[] = [];
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const element = data[key];
      AllExtensions.push(element);
    }
  }

  return AllExtensions;
};
