/*
 * File: \src\internal\extension\utils\exists.ts
 * Project: flish-app
 * Created Date: Wednesday December 8th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 08/12/2021 16:46
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
import { getExtension } from "../read";
/**
 * Check if the extension is part of the config file. It does not ensure that the extension is valid, not corrupted or desinstalled
 * @param id The Id of the extension
 */
export const doesExtensionExist = async (id:string) => {
    const extension = await getExtension(id);
    if (extension) return true;
    return false;
};
