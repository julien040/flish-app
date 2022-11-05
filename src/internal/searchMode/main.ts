import { ipcMain, IpcMainEvent } from "electron";
import { InstanceWindow } from "../../extensionWindow/instanceWIndow";
import DevModeWindow from "../../devModeWindow/devWindow";
import { searchWindow } from "../../searchWindow/window";
import captureEvent from "../analytics";
import { searchResult } from "./types";
import { dialogError } from "../notifications";

function handleSearchInstance(
  type: "dev" | "prod",
  id: string | null,
  instance: InstanceWindow,
  devWindow: DevModeWindow,
  search: searchWindow
): void {
  switch (type) {
    // If the type is "dev", this means the search bar asked to open a development instance.
    case "dev":
      devWindow.create(true);
      captureEvent("Open dev mode with search");
      break;
    // If the type is "prod", this means the search bar asked to open an instance.
    case "prod":
      instance.loadInstance(id);
      break;
    default:
      throw new Error("Invalid type");
  }
  const searchQueries: string[] = [];

  // In this function, we don't use anonymous functions with eventEmitter because we need to remove the listener after the extension is closed.

  // Event sent when the user stops typing in the search bar.
  function searchQuery(e: IpcMainEvent, query: unknown): void {
    let toSend = "";
    if (typeof query === "string") {
      toSend = query;
    }
    type === "dev"
      ? devWindow.sendContent("queryEvent", toSend)
      : instance.sendContent("queryEvent", toSend);

    // We log search
    if (type === "prod") {
      searchQueries.push(toSend);
    }
  }
  ipcMain.on("searchQuery", searchQuery);

  // Event when the extension sends a result to the search bar.
  function searchResult(e: IpcMainEvent, result: searchResult[]): void {
    search.sendContent("resultEvent", result);
  }
  ipcMain.on("searchResult", searchResult);

  // Event when the user clicks on a result in the search bar.
  function resultChosen(e: IpcMainEvent, result: searchResult): void {
    type === "dev"
      ? devWindow.sendContent("resultChosenEvent", result)
      : instance.sendContent("resultChosenEvent", result);
    ipcMain.removeListener("searchQuery", searchQuery);
    ipcMain.removeListener("searchResult", searchResult);
    ipcMain.removeListener("resultChosenEvent", resultChosen);
  }
  ipcMain.once("resultChosenEvent", resultChosen);

  function onError(e: IpcMainEvent, error: string): void {
    search.sendContent("errorEventSearch", error);
    dialogError(error);
  }
  ipcMain.once("errorEventSearch", onError);

  function closeSearchInstance(): void {
    ipcMain.removeListener("searchQuery", searchQuery);
    ipcMain.removeListener("errorEvent", onError);
    ipcMain.removeListener("searchResult", searchResult);
    ipcMain.removeListener("resultChosenEvent", resultChosen);
    ipcMain.removeListener("errorEventSearch", onError);
    if (type === "dev") {
      devWindow.detachDevTools();
    }
    type === "dev"
      ? setTimeout(() => {
          devWindow.destroy();
        }, 20000)
      : setTimeout(() => {
          instance.destroy();
        }, 1000);

    if (type === "prod") {
      captureEvent("Search extension closed", {
        id: id,
        queries: searchQueries,
      });
    }
  }
  ipcMain.once("closeSearchInstance", closeSearchInstance);
}

export default handleSearchInstance;
