/* eslint-disable @typescript-eslint/no-explicit-any */
import { join } from "path";

import { BrowserWindow, screen, ipcMain, shell } from "electron";
import { Instance } from "../internal/instance/types";
import { extension } from "../internal/extension/types";
import { getInstance } from "../internal/instance/read";
import {
  permissionCheckHandler,
  permissionRequestHandler,
  windowOpenHandle,
} from "./handler";
import { Session } from "./session";
import { logConsoleMessage } from "../internal/extension/logging";
import downloadHandler from "./download";
import { dialogError } from "../internal/notifications";

export class InstanceWindow {
  public app: BrowserWindow;
  private InstanceData: Instance;
  private ExtensionData: extension;
  private Session: Session;
  private query = "";

  constructor(id?: string) {
    //This is the constructor. When the class is called, a new browser window is created. If the id is specified, the class will load data about the instance
    /* this.recreateApp(); */
    if (id != undefined) {
      //If the id is specified, the class will load data about the instance
      getInstance(id)
        .then((data) => {
          this.InstanceData = data.instance;
          this.ExtensionData = data.extension;
        })
        .catch((err) => {
          dialogError("The profile does not exist");
          throw new Error(err);
        });
    }
  }
  private recreateApp() {
    const screenSize = screen.getPrimaryDisplay().size;
    if (this.app != undefined) {
      this.app.destroy();
    }
    this.app = new BrowserWindow({
      webPreferences: {
        devTools: true,
        preload: join(__dirname, "preload.js"),
        additionalArguments: [
          // These arguments will be sent as env variable to the preload script
          JSON.stringify(this.ExtensionData),
          JSON.stringify(this.InstanceData),
          JSON.stringify(this.query),
        ],
        partition: `persist:${this.InstanceData.instanceID}`,
      },
      show: !(
        this.ExtensionData.mode === "headless" ||
        this.ExtensionData.mode === "search"
      ),
      autoHideMenuBar: true,
      width: 800,
      height: 600,
      x: screenSize.width / 2 - 400,
      y: screenSize.height / 2 - 120,
    }).on("close", () => this.Session.closeSession());
    this.Session = new Session(this.ExtensionData.uuid);
    ipcMain.on("logApiCall", (event, arg) => {
      this.addAction("fs", arg[0]);
    });
    ipcMain.on("downloadURL", (event, arg) => {
      this.app.webContents.downloadURL(arg);
    });
    this.app.on("closed", () => {
      this.app = null;
      ipcMain.removeAllListeners("logApiCall");
      ipcMain.removeAllListeners("downloadURL");
    });
  }
  // This method show the app
  show(): void {
    this.app.show();
  }
  // This method hide the app
  hide(): void {
    this.app.hide();
  }
  // This method destroys the app. Instance is first closed without any event emitter called and then recreated with empty data
  destroy(): void {
    this.app.destroy();
    this.Session.closeSession();
    this.recreateApp();
  }
  /** This method load an instance of an extension
   * @param id The id of the instance to load
   */
  async loadInstance(id: string): Promise<void> {
    const { extension, instance } = await getInstance(id).catch((err) => {
      dialogError("This extension does not exist");
      throw new Error(err);
    });
    this.InstanceData = instance;
    this.ExtensionData = extension;
    const { path, entry } = this.ExtensionData;
    this.recreateApp();
    this.app.webContents.setWindowOpenHandler((data) => {
      this.Session.addAction("windowOpen", data.url);
      return windowOpenHandle(data);
    });
    //Handler is managed by a callback
    this.app.webContents.session.setPermissionRequestHandler(
      (webContents, permissionRequest, callback) => {
        this.Session.addAction("permissionRequest", permissionRequest);
        permissionRequestHandler(
          { webContents, permissionRequest, callback },
          instance.instanceID
        );
      }
    );
    //Argument is a function returning a boolean
    this.app.webContents.session.setPermissionCheckHandler(
      (permission: any) => {
        this.Session.addAction("permissionCheck", permission);
        return permissionCheckHandler(permission, extension);
      }
    );
    this.app.webContents.on("will-navigate", (e, url) => {
      const link = new URL(url);
      e.preventDefault();
      if (link.protocol === "https:" || link.protocol === "http:") {
        shell.openExternal(link.toString());
      }
    });
    //Avoid CORS issues (Source)[https://pratikpc.medium.com/bypassing-cors-with-electron-ab7eaf331605]
    this.app.webContents.session.webRequest.onBeforeSendHeaders(
      (details, callback) => {
        if (new URL(details.url).protocol !== "devtools:") {
          //Devtools is always spamming the console
          this.Session.addAction("WebRequest", details.url);
        }

        callback({
          requestHeaders: {
            ...details.requestHeaders,
            Origin: "*",
            "User-Agent": "curl/5.0",
          },
        });
      }
    );
    this.app.webContents.session.webRequest.onHeadersReceived(
      (details, callback) => {
        details.responseHeaders["Access-Control-Allow-Origin"] = ["*"];
        details.responseHeaders["Access-Control-Allow-Methods"] = ["*"];
        details.responseHeaders["Access-Control-Allow-Headers"] = ["*"];
        // Some webservers return CORS header, but not capitalized correctly so it leads to duplicate headers
        delete details.responseHeaders["access-control-allow-origin"];
        delete details.responseHeaders["access-control-allow-methods"];
        delete details.responseHeaders["access-control-allow-headers"];
        details.responseHeaders["Content-Security-Policy"] = [
          "default-src 'self'; connect-src * ; child-src * ; font-src 'self' 'unsafe-inline' ; img-src * ; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'self'; frame-src 'self'; media-src * ; frame-ancestors 'self';",
        ];

        callback({
          responseHeaders: details.responseHeaders,
          //Case server does not support CORS, we need to set the status code to 200 when OPTIONS request
          statusLine:
            details.method === "OPTIONS"
              ? "HTTP/1.1 200 OK"
              : details.statusLine,
        });
      }
    );
    this.app.setBackgroundColor("#eff0ff");
    this.app.webContents.session.on("will-download", (event, item) => {
      this.Session.addAction("download", item.getURL());
      downloadHandler(event, item);
    });
    if (!entry) {
      //entry is optional. In case of no entry, default to index.html
      await this.app.webContents
        .loadFile(join(path, "index.html"))
        .catch(() => {
          dialogError(
            "An error occured while loading the files of the extension"
          );
        });
    } else {
      await this.app.webContents.loadFile(join(path, entry)).catch(() => {
        dialogError(
          "An error occured while loading the files of the extension"
        );
      });
    }
    this.app.webContents.on("console-message", (e, level, message) => {
      if (level === 3) {
        logConsoleMessage("danger", this.ExtensionData.uuid, message);
      }
    });
  }
  public addAction(type: string, data: string): void {
    return this.Session.addAction(type, data);
  }
  public reload(): void {
    this.app.reload();
  }
  public openDevTools(): void {
    this.app.webContents.openDevTools();
  }
  public setQueryString(v = ""): void {
    this.query = v;
  }
  public sendContent(channel: string, content: unknown): void {
    this.app.webContents.send(channel, content);
  }
}
