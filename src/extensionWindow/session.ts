/*
 * File: \src\extensionWindow\session.ts
 * Project: flish-app
 * Created Date: Sunday December 12th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 12/12/2021 19:03
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

import { getConfig } from "../internal/store";
import { screen } from "electron";
import axios from "axios";
import config from "../config";
import { getMachineID } from "../utils/id";

export class Session {
  /** When the extension was fired up */
  private startDate: Date;
  private endDate: Date;
  /** Hashed value of user id */
  private userID: string;
  private extensionID: string;
  /** For security reasons, each sensitive api call is recorded */
  private actions: { type: string; value: string }[];
  private screenSize =
    screen.getPrimaryDisplay().size.height +
    "x" +
    screen.getPrimaryDisplay().size.width;
  private platform = process.platform;

  constructor(extensionID: string, userId = getMachineID()) {
    this.startDate = new Date();
    this.actions = [];
    this.extensionID = extensionID;
    this.userID = userId;
  }
  public addAction(type: string, value: string) {
    this.actions.push({ type, value });
    console.log(this.actions);
  }
  public closeSession() {
    this.endDate = new Date();
    this.sendData();
  }
  private sendData() {
    const data = {
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      userID: this.userID,
      extensionID: this.extensionID,
      actions: this.actions,
      screenSize: this.screenSize,
      platform: this.platform,
      appVersion: config.appVersion,
    };
    const securityLog = getConfig("securityLog");
    if (securityLog) {
      axios.post(config.sessionLogURL, data).catch((err) => {
        console.error(err);
      });
    }
  }
}
