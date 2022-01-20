import { BrowserWindow, shell } from "electron";
import { join } from "path";
import { windowOpenHandle } from "../extensionWindow/handler";

export class searchWindow {
  private _window: BrowserWindow;
  constructor() {
    this._window = new BrowserWindow({
      width: 800,
      height: 600,
      transparent: true,
      center: true,
      frame: false,
      show: false,
      webPreferences: {
        preload: join(__dirname, "preload.js"),
        partition: "persist:search",
      },
    });
    this._window.loadFile(join(__dirname, "/../../searchApp/index.html"));

    this._window.on("close", (e) => {
      e.preventDefault();
      this.hide();
    });
    this._window.on("blur", () => this.hide());
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
    /*     this._window.webContents.openDevTools({ mode: "detach" }); */
  }
  public show() {
    this._window.show();
    this._window.focus();
  }
  public hide() {
    this._window.hide();
    this._window.webContents.reload(); //To go back and remove any data
  }
}
