/*
 * File: \src\extensionWindow\instanceWIndow.ts
 * Project: flish-app
 * Created Date: Wednesday December 8th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified:
 * Modified By:
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

import { BrowserWindow } from "electron";
import { Instance } from "../internal/instance/types";
import { extension } from "../internal/extension/types";
import { getInstance } from "../internal/instance/read";

export class InstanceWindow {
  private app: BrowserWindow;
  private InstanceData: Instance;
  private ExtensionData: extension;

  constructor(id?: string) {
    //This is the constructor. When the class is called, a new browser window is created. If the id is specified, the class will load data about the instance
    this.recreateApp();
    if (id != undefined) {
      //If the id is specified, the class will load data about the instance
      getInstance(id).then((data) => {
        this.InstanceData = data.instance;
        this.ExtensionData = data.extension;
      });
    }
  }
  private recreateApp() {
    this.app = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {},
      title: this.InstanceData.name || "Flish extension",
      transparent: true,
      frame: false,
      show: false, //This is to prevent the window from showing up when the app is started.
    });
  }
  /** This method show the app */
  show(): void {
    this.app.show();
  }
  /** This method hide the app */
  hide(): void {
    this.app.hide();
  }
  /** This method destroys the app. Instance is first closed without any event emitter called and then recreated with empty data */
  destroy(): void {
    this.app.destroy();
    this.recreateApp();
  }
  /** This method load an instance of an extension
   * @param id The id of the instance to load
   */
  async loadInstance(id: string): Promise<void> {
    if (id === this.InstanceData.instanceID) {
      return;
    }
    const { extension, instance } = await getInstance(id);
    this.InstanceData = instance;
    this.ExtensionData = extension;
    const { path, entry } = this.ExtensionData;
    if (!entry) { //entry is optional. In case of no entry, default to index.html
      this.app.loadFile(join(path, "index.html"));
    } else {
      this.app.loadFile(join(path, entry));
    }
  }
}
