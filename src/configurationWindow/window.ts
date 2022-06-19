import { BrowserWindow, shell } from "electron";
import { join } from "path";
import { windowOpenHandle } from "./../extensionWindow/handler";
import captureEvent from "../internal/analytics";

export class ConfigurationWindow {
  private _window: BrowserWindow;

  constructor() {
    this._window = new BrowserWindow({
      width: 1200,
      height: 600,
      minWidth: 1200,
      minHeight: 800,
      show: false,
      webPreferences: {
        preload: join(__dirname, "preload.js"),
        partition: "persist:configuration",
      },
      autoHideMenuBar: true,
    });
    this._window.loadFile(
      join(__dirname, "/../../configurationApp/index.html")
    );
    /* this._window.loadURL("http://localhost:3000"); */
    this._window.on("close", (e) => {
      e.preventDefault();
      this._window.hide();
    });
    this.window.webContents.on("will-navigate", (e, url) => {
      const link = new URL(url);
      if (link.protocol === "https:" || link.protocol === "http:") {
        e.preventDefault();
        shell.openExternal(link.toString());
      }
    });
    this.window.webContents.setWindowOpenHandler((data) => {
      return windowOpenHandle(data);
    });
  }
  public destroy(): void {
    this._window.destroy();
  }
  public get window(): BrowserWindow {
    return this._window;
  }
  public show(): void {
    this._window.show();
    this._window.maximize();
    this._window.focus();
    captureEvent("Settings opened");
  }
  public hide(): void {
    this._window.hide();
  }
  private changeURL(url: string): void {
    this._window.webContents.send("changeURL", url);
  }
  public openURL(url: string): void {
    this.changeURL(url);
    if (this._window.isFocused()) {
      return;
    }
    this.show();
  }
}
