import { extension } from "../internal/extension/types";
import { Instance } from "../internal/instance/types";
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { getEnvVariableOfInstance } from "../internal/instance/read";
import { showItemInFolder as sf } from "./api/fs";
import config from "../config";
import { searchResult } from "../internal/searchMode/types";

/* This snippet retrieves the index of the additional argument */
let indexOfExtensionData;
for (let index = 0; index < process.argv.length; index++) {
  const element = process.argv[index];
  try {
    const data = JSON.parse(element);
    if (data.description !== undefined) {
      indexOfExtensionData = index;
      break;
    }
  } catch (error) {
    continue;
  }
}
const extensionData: extension = JSON.parse(process.argv[indexOfExtensionData]);
const instanceData: Instance = JSON.parse(
  process.argv[indexOfExtensionData + 1]
);
const query: string = JSON.parse(process.argv[indexOfExtensionData + 2]);

let envVariable: Record<string, unknown> = null;

getEnvVariableOfInstance(instanceData.instanceID).then(function (res) {
  envVariable = res;
});

contextBridge.exposeInMainWorld("flish", {
  /** This returns informations about the extension */
  extension: extensionData,
  /** This returns informations about the instance */
  instance: instanceData,
  /** This returns the query */
  query: query,
  /** This returns the environment variable specified by the user */
  envVariable: () => {
    while (envVariable == null) {
      continue;
    }
    return envVariable;
  },
  /** A set of APIs to interact with flish */
  application: {
    openProfileSettings: () => {
      ipcRenderer.send("openInstanceSettings", instanceData.instanceID);
    },
    openExtensionPage: () => {
      ipcRenderer.send("openExtensionPage", extensionData.uuid);
    },
    closeApp: () => {
      ipcRenderer.send("closeInstance", instanceData.instanceID);
    },
    getAppVersion: config.appVersion,
    getAuthToken: () => {
      ipcRenderer.send("getAuthToken", instanceData.instanceID);
    },
  },
  /** A set of APIs to act when extension is in search mode */
  search: {
    queryListener: (callback: (query: string) => void) => {
      ipcRenderer.on("queryEvent", (e: IpcRendererEvent, query: string) => {
        callback(query);
      });
    },
    chosenResultListener: (callback: (result: searchResult) => void) => {
      ipcRenderer.on(
        "resultChosenEvent",
        (e: IpcRendererEvent, result: searchResult) => {
          callback(result);
        }
      );
    },
    sendResult: (result: searchResult[]) => {
      ipcRenderer.send("searchResult", result);
    },
    sendError: (error: string) => {
      ipcRenderer.send("errorEventSearch", error);
    },
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
    logEvent: (event: string, data: unknown) => {
      ipcRenderer.send("logRemoteEvent", instanceData.extensionID, {
        event,
        data,
      });
    },
  },
  fs: {
    showItemInFolder: (path: string) => {
      sf(extensionData, path);
    }, //Not working
    downloadURL: (url: string) => {
      ipcRenderer.send("downloadURL", url);
    },
  },
});
