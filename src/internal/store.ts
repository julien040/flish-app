/*
 * File: \src\internal\store.ts
 * Project: flish-app
 * Created Date: Sunday December 5th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 08/12/2021 17:32
 * Modified By: Julien Cagniart
 * -----
 * Copyright (c) 2021 Julien - juliencagniart40@gmail.com
 */
/*  _______ _ _      _                 _             
(_______) (_)    | |               | |            
 _____  | |_  ___| | _           _ | | ____ _   _ 
|  ___) | | |/___) || \         / || |/ _  ) | | |
| |     | | |___ | | | |   _   ( (_| ( (/ / \ V / 
|_|     |_|_(___/|_| |_|  (_)   \____|\____) \_/  
                                                   
 * Purpose of the file :  Handle the config store of the application
 
 * Link to documentation associated with this file :  */

 
import Store = require('electron-store');

/* const schema = {
    data : {
    "type": "object",
    "properties": {
      "extensions": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "uuid": {
              "type": "string" // Unique id for the extension
            },
            "link": {
              "type": "string" // Link to the extension page on the web
            },
            "author": {
              "type": "string" // Link to the profile of the extension author
            },
            "location": {
              "type": "string" //Absolute path to the extension
            },
            "entry_name": {
              "type": "string" // Name of the entry point of the extension page web
            },
            "name": {
              "type": "string" // Name of the extension
            },
            "description": {
              "type": "string" // Description of the extension
            },
            "version": {
              "type": "string" // Version of the extension
            },
            "permissions": { // Permission required by the extension (can be empty)
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "secret": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        }
      },
      "instances": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string" // Name of the instance shown in the UI
            },
            "command": {
              "type": "string" // Command to launch the instance like /gotoMarket
            },
            "shortcut": {
              "type": "string" // Shortcut to launch the instance like Ctrl+Shift+M (can be empty)
            },
            "icon": {
              "type": "string" // Icon to display in the instance list (can be empty)
            },
            "linked_extension": {
              "type": "string" // UUID of the extension linked to the instance
            },
            "id": {
              "type": "string" // Unique id for the instance
            }
          },
          "required": [
            "name",
            "command",
            "isSetup",
            "icon",
            "linked_extension",
            "id"
          ]
        }
      }
    }
}
  }
 */

const store = new Store({name: 'config', /* encryptionKey:"9YpZoMZlo7lfbsWY8Fx1hzTo9BUHSmOT", */ fileExtension:"flish"});

/**
* Description : get Any value from the config
* 
* If the value is not found, return null
* Example : 
 * ```typescript
    await getConfig("key")
* ```
**/
export const getConfig = async (key:string): Promise<any> => {
    return await store.get(key, null);
    
};
/**
* Description : set Any value from the config
* 
* Example : 
 * ```typescript
    setConfig("key.dot", {key: "value"})
* ```
**/
export const setConfig = async (key:string, object:any): Promise<void> => {
    store.set(key, object);
};

/**
* Description : delete Any value in the config
* 
* Example : 
 * ```typescript
    deleteConfig("key.dot")
* ```
**/
export const deleteConfig = async (key:string): Promise<void> => {
  store.delete(key);
};