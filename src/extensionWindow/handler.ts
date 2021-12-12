/*
 * File: \src\extensionWindow\handler.ts
 * Project: flish-app
 * Created Date: Thursday December 9th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 11/12/2021 19:25
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
import { shell, WebContents } from "electron";
import { getInstance } from "../internal/instance/read";
import { HandlerDetails } from "electron";
/**
 * Should be used with a web content handler
 */


export const windowOpenHandle = ({
  url,
}: HandlerDetails): { action: "allow" | "deny" } => {
  const parsedURL = new URL(url); //https://benjamin-altpeter.de/shell-openexternal-dangers/
  if (parsedURL.protocol === "https:" || parsedURL.protocol ==="http:") {
    shell.openExternal(parsedURL.toString());
    return { action: "deny" };
  }
  
  return { action: "deny" };
};

export const permissionRequestHandler = async (
  data: {
    webContents: WebContents;
    permissionRequest:
      | "clipboard-read"
      | "clipboard-write"
      | "media"
      | "display-capture"
      | "mediaKeySystem"
      | "geolocation"
      | "notifications"
      | "midi"
      | "midiSysex"
      | "pointerLock"
      | "fullscreen"
      | "openExternal"
      | "unknown";
    callback: Function;
  },
  instanceID: string
) => {
  const {
    extension: { permissions },
  } = await getInstance(instanceID);
  const { permissionRequest } = data;

  //Notification Request && Notification permission authorized
  if (permissionRequest === "notifications") {
    if (permissions.includes("notifications")) {
      data.callback(true);
    } else {
      data.callback(false);
    }
    // Same for clipboard read
  } else if (permissionRequest === "clipboard-read") {
    if (permissions.includes("clipboard")) {
      data.callback(true);
    } else {
      data.callback(false);
    }
    //Same for clipboard write
  } else if (permissionRequest === "clipboard-write") {
    if (permissions.includes("clipboard")) {
      data.callback(true);
    } else {
      data.callback(false);
    }
    //Same for geolocation
  } else if (permissionRequest === "geolocation") {
    if (permissions.includes("geolocation")) {
      data.callback(true);
    } else {
      data.callback(false);
    }
    //Same for media
  } else if (permissionRequest === "media") {
    if (permissions.includes("media")) {
      data.callback(true);
    } else {
      data.callback(false);
    }
    //Case not corresponding or unauthorized
  } else {
    data.callback(false);
  }
};

export const permissionCheckHandler = (
  permissionRequest:
    | "clipboard-read"
    | "clipboard-write"
    | "geolocation"
    | "media"
    | "notifications"
    | "clipboard",
  extension: extension
): boolean => {
  if (
    permissionRequest === "clipboard-read" ||
    permissionRequest === "clipboard-write"
  ) {
    permissionRequest = "clipboard";
  }
  console.log(permissionRequest);
  console.log(extension.permissions);

  if (extension.permissions.includes(permissionRequest)) {
    return true;
  }
  return false;
};
