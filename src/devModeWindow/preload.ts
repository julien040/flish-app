/*
 * File: \src\extensionWindow\preload.ts
 * Project: flish-app
 * Created Date: Thursday December 9th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 12/12/2021 13:51
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
import { extension } from "../internal/extension/types";
import { Instance } from "../internal/instance/types";
import { contextBridge, ipcRenderer } from "electron";
import {
  appendFile as af,
  mkdir as mk,
  openFolder as of,
  readFile as rf,
  readdir as rd,
  showItemInFolder as sf,
} from "../extensionWindow/api/fs";
import config from "../config";
const extensionData: extension = JSON.parse(process.argv[15]);
const instanceData: Instance = JSON.parse(process.argv[16]);
const query: string = JSON.parse(process.argv[17]);
const envVariable: Object = JSON.parse(process.argv[18]);

contextBridge.exposeInMainWorld("flish", {
  /** This returns informations about the extension */
  extension: extensionData,
  /** This returns informations about the instance */
  instance: instanceData,
  /** This returns the query */
  query: query,
  /** This returns the environment variable specified by the user */
  envVariable: envVariable,
  /** A set of APIs to interact with flish */
  application: {
    openProfileSettings: () => {},
    openExtensionPage: () => {},
    closeApp: () => {},
    getAppVersion: config.appVersion,
    getAuthToken: () => {},
  },
  utilities: {
    getPlatform: () => {
      return process.platform;
    },
    getID: () => {
      return instanceData.instanceID;
    },
  },
  logging: {
    logEvent: (event: string, data: any) => {},
  },
  fs: {
    readFile: (path: string, encoding?: string) => {
      return rf(extensionData, path, encoding);
    },
    readDir: (path: string) => {
      return rd(extensionData, path);
    },
    appendFile: (path: string, data: string) => {
      return af(extensionData, path, data);
    },
    mkDir: (path: string) => {
      return mk(extensionData, path);
    },
    openPath: (path: string) => {
      return of(extensionData, path);
    },
    showItemInFolder: (path: string) => {
      sf(extensionData, path);
    }, //Not working
  },
});
