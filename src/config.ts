/*
 * File: \src\config.js
 * Project: flish-app
 * Created Date: Monday December 6th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 08/12/2021 16:53
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
                                                   
 * Purpose of this file : Describe the application configuration
 *  Link to documentation associated with this file : (fill it)
 */

/** 
 * @fileoverview Configuration file for the application
*/
export default {
    /** URL of the API for the extension marketplace */
    extensionApiURL: "https://61ac225a264ec200176d43b7.mockapi.io/v1/extension/",
    /** When using keychain (or its equivalent), keytar library require a service name. */
    secureStoreAppName: "flish-app",
};
