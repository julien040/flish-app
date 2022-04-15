import log = require("electron-log");
import { captureMessage } from "@sentry/electron";
import winston = require("winston");
import { resolve } from "path";
import userDataPath from "../../utils/getUserDataPath";

const extensionLogger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: resolve(userDataPath, "logs", "extensionError.log"),
      maxFiles: 5,
      maxsize: 5242880,
      tailable: true,
    }),
  ],
});

function logConsoleMessage(
  type: "danger" | "warn" | "info",
  extensionID: string,
  message: string
): void {
  switch (type) {
    case "danger":
      extensionLogger.error({ extensionID, message });
      break;
    case "warn":
      extensionLogger.warn({ extensionID, message });
      break;
    case "info":
      extensionLogger.info({ extensionID, message });
      break;
    default:
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
