import { BrowserWindow, shell, ipcMain } from "electron";
import { join } from "path";
import { windowOpenHandle } from "../extensionWindow/handler";
import { extension } from "../internal/extension/types";
import { Instance } from "../internal/instance/types";
import { getConfig } from "../internal/store";
import captureEvent from "../internal/analytics";
import downloadHandler from "../extensionWindow/download";

class DevModeWindow {
  private _window: BrowserWindow;
  private url = "http://localhost:3000/";
  private query = "";
  private mockData = {};
  private headless = false;
  private extension: extension;
  private instance: Instance;
  constructor() {
    this.extension = {
      description: "Extension in dev mode",
      hash: "",
      icon: "",
      downloadURL: "",
      name: "Dev Mode",
      permissions: ["clipboard", "fs", "geolocation", "media", "notifications"],
      envVariables: [],
      path: "",
      uuid: "",
      version: "",
      README: "",
      link: "",
      tutorial: "",
    };
    this.instance = {
      extensionID: "",
      instanceID: "",
      name: "Dev Mode",
    };
    this.refreshData();
  }
  public refresh(): void {
    this._window.webContents.reload();
  }
  public async refreshData(): Promise<void> {
    const urlDevMode = await getConfig("urlDevMode");
    const mockDevMode = await getConfig("mockDevMode");
    const queryDevMode = await getConfig("queryDevMode");
    const headlessDevMode = await getConfig("headlessDevMode");
    if (urlDevMode != null) {
      this.url = urlDevMode;
    }
    if (mockDevMode != null) {
      this.mockData = mockDevMode;
    }
    if (queryDevMode != null) {
      this.query = queryDevMode;
    }
    if (headlessDevMode != null) {
      this.headless = headlessDevMode;
    }
  }

  public async create(): Promise<void> {
    await this.refreshData();
    if (this._window) {
      this._window.destroy();
    } else {
      captureEvent("devMode opened", {
        url: this.url,
        headless: this.headless,
        isQueryEmpty: this.query === "",
        isMockEmpty: Object.keys(this.mockData).length === 0,
      });
    }

    this._window = new BrowserWindow({
      width: 800,
      height: 600,
      center: true,
      show: !this.headless,
      webPreferences: {
        preload: join(__dirname, "preload.js"),
        additionalArguments: [
          JSON.stringify(this.extension),
          JSON.stringify(this.instance),
          JSON.stringify(this.query),
          JSON.stringify(this.mockData),
        ],
      },
    });
    ipcMain.on("downloadURLDev", (event, arg) => {
      this._window.webContents.downloadURL(arg);
    });
    this._window.webContents.session.on("will-download", downloadHandler);
    this._window.loadURL(this.url);
    this._window.webContents.on("will-navigate", (e, url) => {
      const link = new URL(url);
      if (link.protocol === "https:" || link.protocol === "http:") {
        e.preventDefault();
        shell.openExternal(link.toString());
      }
    });
    this._window.webContents.setWindowOpenHandler((data) => {
      return windowOpenHandle(data);
    });
    //Avoid CORS issues (Source)[https://pratikpc.medium.com/bypassing-cors-with-electron-ab7eaf331605]
    this._window.webContents.session.webRequest.onBeforeSendHeaders(
      (details, callback) => {
        callback({
          requestHeaders: { ...details.requestHeaders, Origin: "*" },
        });
      }
    );
    this._window.webContents.session.webRequest.onHeadersReceived(
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
          statusLine:
            details.method === "OPTIONS"
              ? "HTTP/1.1 200 OK"
              : details.statusLine,
        });
      }
    );
    this._window.setBackgroundColor("#eff0ff");
  }
  public openDevTools(): void {
    this._window.webContents.openDevTools({ mode: "detach" });
  }
  public destroy(): void {
    this._window.destroy();
  }
  public sendContent(channel: string, content: unknown): void {
    this._window.webContents.send(channel, content);
  }
}

export default DevModeWindow;
