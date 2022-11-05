//Electron
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

//Extensions
import { installExtension } from "../internal/extension/install";
import { getExtension, getAllExtensions } from "../internal/extension/read";
import deleteExtension from "../internal/extension/delete";

//Instances
import {
  getInstance,
  getAllInstances,
  getEnvVariableOfInstance,
} from "../internal/instance/read";
import { createInstance } from "../internal/instance/create";
import { updateEnvVariables } from "../internal/instance/types";
import { updateInstance } from "../internal/instance/update";
import { deleteInstance } from "../internal/instance/delete";

//Bookmarks
import { createBookmark } from "../internal/bookmark/create";
import { getAllBookmarksArray } from "../internal/bookmark/read";
import deleteBookmark from "../internal/bookmark/delete";

//Config
import config from "../config";
import { getConfig, setConfig } from "../internal/store";

contextBridge.exposeInMainWorld("admin", {
  changeURL: (callback: (url: string) => void) => {
    ipcRenderer.on("changeURL", (e: IpcRendererEvent, url: string) => {
      callback(url);
    });
  },
  installExtension: async (extensionID: string) => {
    try {
      await installExtension(extensionID);
    } catch (error) {
      console.error(error);
    }
  },
  getExtension: async (extensionID: string) => {
    return await getExtension(extensionID);
  },
  getExtensions: async () => {
    return await getAllExtensions();
  },
  deleteExtension: async (extensionID: string) => {
    try {
      await deleteExtension(extensionID);
    } catch (error) {
      console.error(error);
    }
  },
  getInstance: async (instanceID: string) => {
    return await getInstance(instanceID);
  },
  getAllInstances: async () => {
    return await getAllInstances();
  },
  createInstance: async (
    id: string,
    name: string,
    envVariable: updateEnvVariables[]
  ) => {
    await createInstance(id, { name, envVariable });
  },
  deleteInstance: async (id: string) => {
    await deleteInstance(id);
  },
  getEnvVariable: async (instanceID: string) => {
    return await getEnvVariableOfInstance(instanceID);
  },
  updateInstance: async (
    instanceID: string,
    {
      keyboard,
      name,
      envVariable,
    }: { keyboard: string; name: string; envVariable: updateEnvVariables[] }
  ) => {
    return await updateInstance(instanceID, { keyboard, name, envVariable });
  },
  getConfig: () => {
    return config;
  },
  //Bookmarks
  createBookmark: async (name: string, url: string, icon?: string) => {
    await createBookmark(name, url, icon);
  },
  getAllBookmarks: async () => {
    return await getAllBookmarksArray();
  },
  deleteBookmark: async (bookmarkID: string) => {
    return await deleteBookmark(bookmarkID);
  },
  //Params
  setTelemetry: async (value: boolean) => {
    await setConfig("telemetry", value);
  },
  setExtensionAnalytics: async (value: boolean) => {
    await setConfig("telemetryExtension", value);
  },
  setSecurityLog: async (value: boolean) => {
    await setConfig("securityLog", value);
  },
  setShortcut: async (keystroke: string) => {
    await setConfig("shortcut", keystroke);
  },
  setFirstStart: async () => {
    await setConfig("firstStart", false);
  },
  getSettings: async () => {
    return {
      telemetry: await getConfig("telemetry"),
      securityLog: await getConfig("securityLog"),
      shortcut: await getConfig("shortcut"),
      firstStart: await getConfig("firstStart"),
      telemetryExtension: await getConfig("telemetryExtension"),
    };
  },
  getURLDevMode: async () => {
    return await getConfig("urlDevMode");
  },
  setURLDevMode: async (value: string) => {
    if (value === "") {
      throw new Error("The URL cannot be empty");
    }
    if (!value.startsWith("http")) {
      throw new Error("The URL must start with http or https");
    }
    await setConfig("urlDevMode", value);
  },
  getMockDevMode: async () => {
    return await getConfig("mockDevMode");
  },
  setMockDevMode: async (value: string) => {
    try {
      JSON.parse(value);
      await setConfig("mockDevMode", JSON.parse(value));
    } catch (error) {
      throw new Error("Invalid JSON");
    }
  },
  setQueryDevMode: async (value?: string) => {
    if (value) {
      await setConfig("queryDevMode", value);
    } else {
      await setConfig("queryDevMode", "");
    }
  },
  getQueryDevMode: async () => {
    return (await getConfig("queryDevMode")) || "";
  },
  setHeadlessDevMode: async (value?: boolean) => {
    if (value) {
      await setConfig("headlessDevMode", value);
    } else {
      await setConfig("headlessDevMode", false);
    }
  },
  getHeadlessDevMode: async () => {
    return (await getConfig("headlessDevMode")) || false;
  },
});
