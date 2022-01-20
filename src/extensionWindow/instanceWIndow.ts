/*
 * File: \src\extensionWindow\instanceWIndow.ts
 * Project: flish-app
 * Created Date: Wednesday December 8th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 13/12/2021 16:50
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

import { join } from "path";

import { BrowserWindow, screen, ipcMain } from "electron";
import { Instance } from "../internal/instance/types";
import { extension } from "../internal/extension/types";
import { getInstance } from "../internal/instance/read";
import {
  permissionCheckHandler,
  permissionRequestHandler,
  windowOpenHandle,
} from "./handler";
import { Session } from "./session";

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
      getInstance(id).then((data) => {
        this.InstanceData = data.instance;
        this.ExtensionData = data.extension;
      });
    }
  }
  private recreateApp() {
    const screenSize = screen.getPrimaryDisplay().size;
    console.log(this.query, "query");

    this.app = new BrowserWindow({
      webPreferences: {
        devTools: true,
        preload: join(__dirname, "preload.js"),
        additionalArguments: [
          JSON.stringify(this.ExtensionData),
          JSON.stringify(this.InstanceData),
          JSON.stringify(this.query),
        ],
        partition: `persist:${this.InstanceData.instanceID}`,
      },
      show: this.ExtensionData.mode === "headless" ? false : true,
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
    /* if (this.InstanceData != undefined) {
      //Case application ask to load an instance while already being loaded
      if (this.InstanceData.instanceID == id) {
        return;
      }
    } */
    const { extension, instance } = await getInstance(id);
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
      (webcontent, permission: any, requestingOrigin) => {
        this.Session.addAction("permissionCheck", permission);
        return permissionCheckHandler(permission, extension);
      }
    );
    //Avoid CORS issues (Source)[https://pratikpc.medium.com/bypassing-cors-with-electron-ab7eaf331605]
    this.app.webContents.session.webRequest.onBeforeSendHeaders(
      (details, callback) => {
        if (new URL(details.url).protocol !== "devtools:") {
          //Devtools is always spamming the console
          this.Session.addAction("WebRequest", details.url);
        }

        callback({
          requestHeaders: { ...details.requestHeaders, Origin: "*" },
        });
      }
    );
    this.app.webContents.session.webRequest.onHeadersReceived(
      (details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [
              "default-src 'self'; connect-src * ; child-src * ; font-src 'self'; img-src * ; style-src 'self'; script-src 'self'; object-src 'self'; frame-src 'self'; media-src * ; frame-ancestors 'self';",
            ],
            "Access-Control-Allow-Origin": ["*"],
            "Access-Control-Allow-Headers": ["*"],
            "Access-Control-Allow-Methods": ["*"],
          },
        });
      }
    );
    this.app.setBackgroundColor("#eff0ff");
    if (!entry) {
      //entry is optional. In case of no entry, default to index.html
      await this.app.webContents.loadFile(join(path, "index.html"));
    } else {
      await this.app.webContents.loadFile(join(path, entry));
    }
  }
  public addAction(type: string, data: string) {
    return this.Session.addAction(type, data);
  }
  public reload() {
    this.app.reload();
  }
  public openDevTools() {
    this.app.webContents.openDevTools();
  }
  public setQueryString(v = "") {
    this.query = v;
  }
}
