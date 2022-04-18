import { dialog } from "electron";
import nativeImageIcon from "../internal/images";
import { logMessage } from "./logging/logging";

function notifyError(error: string): void {
  dialog.showMessageBox({
    message: "An error occured",
    title: "Check your logs",
    detail: error,
    type: "error",
    icon: nativeImageIcon.error,
  });
  logMessage("error", error);
}

export { notifyError };
