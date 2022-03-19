import log = require("electron-log");
import { captureMessage } from "@sentry/electron";

function logConsoleMessage(
  type: "danger" | "warn" | "info",
  extensionID: string,
  message: string
): void {
  switch (type) {
    case "danger":
      log.error(`${extensionID} | ${message}`);
      break;
    case "warn":
      log.warn(`${extensionID} | ${message}`);
      break;
    case "info":
      log.info(`${extensionID} | ${message}`);
      break;
  }
}
function logPreloadError(message: string, path: string): void {
  log.error(`${message} ${path}`);
  captureMessage(message, {
    extra: {
      path,
    },
    tags: { where: "preload" },
  });
}

export { logConsoleMessage, logPreloadError };
