import { BrowserWindow, shell } from "electron";
import { join } from "path";
import { windowOpenHandle } from "../extensionWindow/handler";
import captureEvent from "../internal/analytics";

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
      thickFrame: false,
      webPreferences: {
        preload: join(__dirname, "preload.js"),
        partition: "persist:search",
      },
    });
    /* this._window.loadURL("http://localhost:3000"); */
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
  }
  public show(): void {
    captureEvent("Search bar opened");
    this._window.show();
    this._window.focus();
  }
  public destroy(): void {
    this._window.destroy();
  }
  public hide(): void {
    this._window.hide();
    setTimeout(() => {
      this._window.reload();
    }, 500);
  }
  public sendContent(
    channel: string,
    content:
      | Array<string | Record<string, unknown> | number>
      | string
      | number
      | Record<string, unknown>
  ): void {
    this._window.webContents.send(channel, content);
  }
}
