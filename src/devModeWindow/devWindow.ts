import { BrowserWindow, shell } from "electron";
import { join } from "path";
import { windowOpenHandle } from "../extensionWindow/handler";
import { extension } from "../internal/extension/types";
import { Instance } from "../internal/instance/types";
import { getConfig } from "../internal/store";
import {
  permissionCheckHandler,
  permissionRequestHandler,
} from "../extensionWindow/handler";

class DevModeWindow {
  private _window: BrowserWindow;
  private url: string = "http://localhost:3000/";
  private query: string = "";
  private mockData: Object = {};
  private headless: boolean = false;
  private extension: extension;
  private instance: Instance;
  constructor() {
    this.extension = {
      description: "Extension in dev mode",
      downloadURL: "https://example.com",
      hash: "",
      icon: "",
      link: "",
      name: "Dev Mode",
      permissions: ["clipboard", "fs", "geolocation", "media", "notifications"],
      envVariables: [],
      path: "",
      textSuggestion: [],
      uuid: "",
      version: "",
    };
    this.instance = {
      extensionID: "",
      instanceID: "",
      name: "Dev Mode",
    };
    this.refreshData();
  }
  public refresh() {
    this._window.webContents.reload();
  }
  public async refreshData() {
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

  public async create() {
    if (this._window) {
      this._window.destroy();
    }
    await this.refreshData();
    this._window = new BrowserWindow({
      width: 800,
      height: 600,
      center: true,
      show: !this.headless,
      webPreferences: {
        preload: join(__dirname, "preload.js"),
        partition: "devMode",
        additionalArguments: [
          JSON.stringify(this.extension),
          JSON.stringify(this.instance),
          JSON.stringify(this.query),
          JSON.stringify(this.mockData),
        ],
      },
    });
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
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [
              "default-src 'self'; connect-src * ; child-src * ; font-src 'self' 'unsafe-inline' ; img-src * ; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'self'; frame-src 'self'; media-src * ; frame-ancestors 'self';",
            ],
            "Access-Control-Allow-Origin": ["*"],
            "Access-Control-Allow-Headers": ["*"],
            "Access-Control-Allow-Methods": ["*"],
          },
        });
      }
    );
    this._window.setBackgroundColor("#eff0ff");
  }
  public openDevTools() {
    this._window.webContents.openDevTools({ mode: "detach" });
  }
  public destroy() {
    this._window.destroy();
  }
}

export default DevModeWindow;
