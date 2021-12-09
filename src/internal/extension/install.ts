/*
 * File: \src\internal\extension\install.ts
 * Project: flish-app
 * Created Date: Sunday December 5th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 09/12/2021 10:04
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
                                                   
 * Purpose of this file : Install an extension from the web
 *  Link to documentation associated with this file : (empty) 
 */

import { extension } from "./types";
import config from "../../config"
import { app } from "electron";
import { join } from "path";
import https = require("https");
import axios from "axios";
const unzipper = require("unzipper");
import { setConfig } from "../store";

/**
* Description : Install an extension from an api specified in the config file
* 
* @param uuid The unique id of the extension from the api
* @param callback A function explaining the status of the installation (Possible values : **"Waiting API", "Manifest fetched", "Downloading", "Installed"**)
* @param path The path where the extension will be installed (optional)
* Example : 
 * ```typescript
 await installExtension("656454sd5f4s5", callback, "C://Users/Loki/Desktop/");
```*/

export const installExtension = async (
  uuid: string,
  callback?: (info: string) => void,
  path?: string
) => {
  // Get the extension from the api
  const urlManifest = config.extensionApiURL + uuid;
  if (!callback) { //In case no callback has been given
    callback = (): void => {};
  }
  callback("Waiting API");
  const { data } = await axios.get<extension>(urlManifest);
  callback("Manifest Fetched");
  const userPath = app.getPath("appData");  //Return the folder where the data for the application is stored. It's an electron feature
  var folderToExtract: string; //In case no path has been given, we will use the default one (userPath/extensions/{uuid})
  if (!path) {
    folderToExtract = join(userPath, "extensions", uuid);
  } else {
    folderToExtract = path;
  }
  https.get(data.downloadURL, (res: any) => { //Make an https request to the download url. The response should always be a zip file
    callback("Downloading");
    const extractor = res.pipe(unzipper.Extract({ path: folderToExtract })); //Transform the response into a stream and extract it in the folderToExtract. The unzipper module is used to extract the zip file. Using a stream is more efficient and clear than putting file into the memory.
    extractor.on("finish", async () => { //When the extraction is finished, we will set the config of the extension
      await setConfig(`extensions.${uuid}`, { ...data, path: folderToExtract });
      callback("Installed");
    });
  });
};
