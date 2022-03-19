import { contextBridge, ipcRenderer, shell } from "electron";
import { getAllInstances } from "../internal/instance/read";
import { getAllBookmarksArray } from "../internal/bookmark/read";
import { getExtension } from "../internal/extension/read";
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

  openSettings: (page: string) => {
    ipcRenderer.send("openSettings", page);
  },
  openDevMode: () => {
    ipcRenderer.send("openDevMode");
  },
  launchInstance: (uuid: string, query: string) => {
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
          explanation: extension.explanation,
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
