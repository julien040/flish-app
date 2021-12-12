/*
 * File: \src\main.ts
 * Project: flish-app
 * Created Date: Sunday December 5th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 12/12/2021 19:02
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

import { app, BrowserView, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { InstanceWindow } from "./extensionWindow/instanceWIndow";
import { createInstance } from "./internal/instance/create";
import config from "./config"

async function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    width: 800,
  });
  mainWindow.loadFile(path.join(__dirname, "../index.html"));
  instanceWindow = new InstanceWindow();
  await instanceWindow.loadInstance("7t_AlP0TRx9niCsFj0cTx");
  
}
var instanceWindow: InstanceWindow;
app.on("ready", async () => {
  createWindow();
  

  ipcMain.on("logApiCall", (event, arg) => {
    console.log(arg);
    instanceWindow.addAction("fs", arg[0]);
  });
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
