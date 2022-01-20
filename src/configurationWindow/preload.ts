/*
 * File: \src\configurationWindow\preload.ts
 * Project: flish-app
 * Created Date: Monday December 13th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 16/12/2021 15:01
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
import { join } from "path";
import { contextBridge, app, shell } from "electron";
import { installExtension } from "../internal/extension/install";
import { getExtension, getAllExtensions } from "../internal/extension/read";
import {
  getInstance,
  getAllInstances,
  getEnvVariableOfInstance,
} from "../internal/instance/read";
import { createInstance } from "../internal/instance/create";
import { updateEnvVariables } from "../internal/instance/types";
import { updateInstance } from "../internal/instance/update";
import config from "../config";
import { getConfig, setConfig } from "../internal/store";

contextBridge.exposeInMainWorld("admin", {
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
    return await createInstance(id, { name, envVariable });
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
