import { contextBridge, ipcRenderer } from "electron";
import { getAllInstances } from "../internal/instance/read";
import { getExtension } from "../internal/extension/read";

contextBridge.exposeInMainWorld("admin", {
  getInstances: async () => {
    return await getAllInstances();
  },
  getExtension: async (uuid: string) => {
    return await getExtension(uuid);
  },
  openSettings: (page: string) => {
    ipcRenderer.send("openSettings", page);
  },
  launchInstance: (uuid: string, query:string) => {
    ipcRenderer.send("launchInstance", uuid, query);
  },
  getData: async () => {
    const instances = await getAllInstances();
    let data = [];
    for (const key in instances) {
      if (Object.prototype.hasOwnProperty.call(instances, key)) {
        const element = instances[key];
        const extension = await getExtension(element.extensionID);
        data.push({
          value: element.instanceID,
          label: element.name,
          description: extension.description,
          icon: extension.icon,
          textSuggestion: extension.textSuggestion,
          extensionName: extension.name,
          mode: extension.mode,

        });
      }
    }
    return data;
  },
});
