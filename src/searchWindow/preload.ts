import { contextBridge, ipcRenderer, shell, IpcRendererEvent } from "electron";
import { getAllInstances } from "../internal/instance/read";
import { getAllBookmarksArray } from "../internal/bookmark/read";
import { getExtension } from "../internal/extension/read";
import { searchResult } from "../internal/searchMode/types";
import { getURLDevMode } from "../utils/getConfig";
import { bookmark } from "../internal/bookmark/create";

contextBridge.exposeInMainWorld("admin", {
  getInstances: async () => {
    return await getAllInstances();
  },
  getExtension: async (uuid: string) => {
    return await getExtension(uuid);
  },
  openExternal: (url: string) => {
    shell.openExternal(url);
  },
  search: {
    sendQuery: (query: string) => {
      ipcRenderer.send("searchQuery", query);
    },
    eventResult: (callback: (result: searchResult[]) => void) => {
      ipcRenderer.on(
        "resultEvent",
        (e: IpcRendererEvent, result: searchResult[]) => {
          callback(result);
        }
      );
    },
    optionChosen: (result: searchResult) => {
      ipcRenderer.send("resultChosenEvent", result);
    },
    /**
     * @param  {"dev"|"prod"} type If dev, open the instance in dev mode. If prod, open the instance from extension Window
     * @param  {string} id If dev, is undefined. If prod, the id of the instance
     */
    launchSearchInstance: (type: "dev" | "prod", id?: string): void => {
      if (type === "dev") {
        ipcRenderer.send("createSearchInstance", "dev");
      } else {
        ipcRenderer.send("createSearchInstance", "prod", id);
      }
      return;
    },
    closeSearchInstance: (): void => {
      ipcRenderer.send("closeSearchInstance");
    },
    onError: (callback: (error: string) => void) => {
      ipcRenderer.on(
        "errorEventSearch",
        (e: IpcRendererEvent, error: string) => {
          callback(error);
        }
      );
    },
  },
  other: {
    getURLDevMode: async () => {
      return await getURLDevMode();
    },
  },
  openSettings: (page: string) => {
    ipcRenderer.send("openSettings", page);
  },
  openDevMode: () => {
    ipcRenderer.send("openDevMode");
  },
  launchInstance: (uuid: string, query?: string) => {
    ipcRenderer.send("launchInstance", uuid, query);
  },
  getData: async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Array<bookmark | any> = [];
    // Format each instance for the frontend
    const instances = await getAllInstances();
    for (const key in instances) {
      if (Object.prototype.hasOwnProperty.call(instances, key)) {
        const element = instances[key];
        const extension = await getExtension(element.extensionID);
        data.push({
          value: element.instanceID,
          label: element.name,
          description: extension.description,
          icon: extension.icon,
          extensionName: extension.name,
          mode: extension.mode,
          placeholder: extension.placeholder,
          readme: extension.README,
          tutorial: extension.tutorial,
          marketplaceLink: extension.link,
        });
      }
    }
    // Format each bookmark for the frontend
    const bookmarks = await getAllBookmarksArray();
    for (let index = 0; index < bookmarks.length; index++) {
      const element = bookmarks[index];
      data.push({
        value: element.bookmarkID,
        label: element.name,
        icon: element.icon,
        mode: "bookmark",
        url: element.url,
      });
    }
    data.concat(bookmarks);
    return data;
  },
});
