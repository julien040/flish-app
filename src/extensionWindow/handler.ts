/*
 * File: \src\extensionWindow\handler.ts
 * Project: flish-app
 * Created Date: Thursday December 9th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 09/12/2021 11:31
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

import { shell } from "electron";



export const windowOpenHandle = ({ url }: { url: string }) => {
    shell.openExternal(url);
    return {action:'deny'}
};
