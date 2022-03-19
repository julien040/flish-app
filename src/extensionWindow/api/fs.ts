import {
  readFile as rf,
  appendFile as af,
  readdir as rd,
  mkdir as mk,
} from "fs/promises";
import { shell, ipcRenderer } from "electron";
import { extension } from "../../internal/extension/types";

const readFile = async (
  extension: extension,
  path: string,
  encoding: unknown = "utf8"
): Promise<Buffer> => {
  logApiCallFileSystem(extension, "readFile", path);
  if (checkPermission(extension)) {
    return await rf(path, encoding);
  } else {
    throw new Error("Permission denied. Add 'fs' to extension permissions");
  }
};
const appendFile = async (
  extension: extension,
  path: string,
  data: string,
  encoding?: unknown
): Promise<void> => {
  logApiCallFileSystem(extension, "appendFile", path);
  if (checkPermission(extension)) {
    return await af(path, data, encoding);
  }
  throw new Error("Permission denied. Add 'fs' to extension permissions");
};
const readdir = async (
  extension: extension,
  path: string
): Promise<string[]> => {
  logApiCallFileSystem(extension, "readdir", path);
  if (checkPermission(extension)) {
    return await rd(path);
  }
  throw new Error("Permission denied. Add 'fs' to extension permissions");
};
const mkdir = async (extension: extension, path: string): Promise<void> => {
  logApiCallFileSystem(extension, "mkdir", path);
  if (checkPermission(extension)) {
    return await mk(path);
  } else {
    throw new Error("Permission denied. Add 'fs' to extension permissions");
  }
};
const showItemInFolder = (extension: extension, path: string): void => {
  logApiCallFileSystem(extension, "showItemInFolder", path);
  if (checkPermission(extension)) {
    shell.showItemInFolder(path);
  } else {
    throw new Error("Permission denied. Add 'fs' to extension permissions");
  }
};
const openFolder = async (
  extension: extension,
  path: string
): Promise<void> => {
  logApiCallFileSystem(extension, "openFolder", path);
  if (checkPermission(extension)) {
    await shell.openPath(path);
  } else {
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
