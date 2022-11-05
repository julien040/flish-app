import { extension } from "../internal/extension/types";
import { Instance } from "../internal/instance/types";
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { searchResult } from "../internal/searchMode/types";
import { showItemInFolder as sf } from "../extensionWindow/api/fs";
import config from "../config";

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
const envVariable: Record<string, unknown> = JSON.parse(
  process.argv[indexOfExtensionData + 3]
);

contextBridge.exposeInMainWorld("flish", {
  /** This returns informations about the extension */
  extension: extensionData,
  /** This returns informations about the instance */
  instance: instanceData,
  /** This returns the query */
  query: query,
  /** This returns the environment variable specified by the user */
  envVariable: () => {
    return envVariable;
  },
  /** A set of APIs to interact with flish */
  application: {
    /* openProfileSettings: () => {},
    openExtensionPage: () => {},
    closeApp: () => {}, */
    getAppVersion: config.appVersion,
    /* getAuthToken: () => {}, */
  },
  utilities: {
    getPlatform: () => {
      return process.platform;
    },
    getID: () => {
      return instanceData.instanceID;
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
  logging: {
    /* logEvent: (event: string, data: any) => {}, */
  },
  fs: {
    showItemInFolder: (path: string) => {
      sf(extensionData, path);
    }, //Not working
    downloadURL: (url: string) => {
      ipcRenderer.send("downloadURLDev", url);
    },
  },
});
