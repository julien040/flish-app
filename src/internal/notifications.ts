import { dialog } from "electron";
import nativeImageIcon from "./nativeImages";
import { logMessage } from "./logging/logging";

function dialogError(error: string): void {
  dialog.showMessageBox({
    message: "An error occured",
    title: "Check your logs",
    detail: error,
    type: "error",
    icon: nativeImageIcon.error,
  });
  logMessage("error", error);
}

function dialogInfo(title: string, info: string): void {
  dialog.showMessageBox({
    message: "Information",
    title: title,
    detail: info,
    type: "info",
    icon: nativeImageIcon.info,
  });
  logMessage("info", info);
}

export { dialogError, dialogInfo };
