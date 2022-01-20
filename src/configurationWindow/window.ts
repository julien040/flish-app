/*
 * File: \src\configurationWindow\window.ts
 * Project: flish-app
 * Created Date: Monday December 13th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 16/12/2021 10:33
 * Modified By: Julien Cagniart
 * -----
 * Copyright (c) 2021 Julien - juliencagniart40@gmail.com
 * -----
 * _______ _ _      _                 _             
(_______) (_)    | |               | |            
 _____  | |_  ___| | _           _ | | ____ _   _ 
|  ___) | | |/___) || \         / || |/ _  ) | | |
| |     | | |___ | | | |   _   ( (_| ( (/ / \ V / 
|_|     |_|_(___/|_| |_|  (_)   \____|\____) \_/  
                                                   
 * Purpose of this file : 
 *  Link to documentation associated with this file : (empty) 
 */

import { BrowserWindow, shell } from "electron";
import { join } from "path";
import { windowOpenHandle } from "./../extensionWindow/handler";

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
      let link = new URL(url);
      if (link.protocol === "https:" || link.protocol === "http:") {
        e.preventDefault();
        shell.openExternal(link.toString());
      }
    });
    this.window.webContents.setWindowOpenHandler((data) => {
      return windowOpenHandle(data);
    });
  }

  public get window(): BrowserWindow {
    return this._window;
  }
  public show(): void {
    this._window.show();
    this._window.maximize();
    this._window.focus();
  }
  public hide(): void {
    this._window.hide();
  }
}
