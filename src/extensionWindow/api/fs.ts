/*
 * File: \src\extensionWindow\api\fs.ts
 * Project: flish-app
 * Created Date: Sunday December 12th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 12/12/2021 19:04
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
                                                   
 * Purpose of this file : Expose FS api to extensions. Emit event for further logging
 *  Link to documentation associated with this file : (empty) 
 */
import {
  readFile as rf,
  appendFile as af,
  readdir as rd,
  mkdir as mk,
} from "fs/promises";
import { shell, ipcRenderer } from "electron";
import { extension } from "../../internal/extension/types";
import path = require("path");
import { getHashID } from "../../utils/id";

const readFile = async (
  extension: extension,
  path: string,
  encoding: any = "utf8"
) => {
  logApiCallFileSystem(extension, "readFile", path);
  if (checkPermission(extension)) {
    return await rf(path, encoding);
  }
  else {
  throw new Error("Permission denied. Add 'fs' to extension permissions");
  }
};
const appendFile = async (
  extension: extension,
  path: string,
  data: any,
  encoding?: any
) => {
  logApiCallFileSystem(extension, "appendFile", path);
  if (checkPermission(extension)) {
    return await af(path, data, encoding);
  }
  throw new Error("Permission denied. Add 'fs' to extension permissions");
};
const readdir = async (extension: extension, path: string) => {
  logApiCallFileSystem(extension, "readdir", path);
  if (checkPermission(extension)) {
    return await rd(path);
  }
  throw new Error("Permission denied. Add 'fs' to extension permissions");
};
const mkdir = async (extension: extension, path: string) => {
  logApiCallFileSystem(extension, "mkdir", path);
  if (checkPermission(extension)) {
    return await mk(path);
  }
  else {
  throw new Error("Permission denied. Add 'fs' to extension permissions");
    }
};
const showItemInFolder = (extension: extension, path: string) => {
  logApiCallFileSystem(extension, "showItemInFolder", path);
  if (checkPermission(extension)) {
    shell.showItemInFolder(path);
  }
    else {
  throw new Error("Permission denied. Add 'fs' to extension permissions");
    }
};
const openFolder = async (extension: extension, path: string) => {
  logApiCallFileSystem(extension, "openFolder", path);
  if (checkPermission(extension)) {
    await shell.openPath(path);
  }
  else {
  throw new Error("Permission denied. Add 'fs' to extension permissions");
  }
};
export { readFile, appendFile, readdir, mkdir, showItemInFolder, openFolder };

function checkPermission(extension: extension) {
  if (extension.permissions.includes("fs")) {
    return true;
  }
  return false;
}

function logApiCallFileSystem(extension: extension, api: string, path: string) {
  ipcRenderer.send("logApiCall", path);
}
