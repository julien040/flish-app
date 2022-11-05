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
  // Dangerous protocol
  if (
    parsedURL.protocol === "smb:" ||
    parsedURL.protocol === "nfs:" ||
    parsedURL.protocol === "ftp:" ||
    parsedURL.protocol === "file:" ||
    parsedURL.protocol === "jnlp:"
  ) {
    return { action: "deny" };
  }
  shell.openExternal(parsedURL.toString());
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
    callback: (response: boolean) => void;
  },
  instanceID: string
): Promise<void> => {
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

  if (extension.permissions.includes(permissionRequest)) {
    return true;
  }
  return false;
};
