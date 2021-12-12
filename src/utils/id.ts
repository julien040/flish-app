/*
 * File: \src\utils\id.ts
 * Project: flish-app
 * Created Date: Sunday December 12th 2021
 * Author: Julien Cagniart
 * -----
 * Last Modified: 12/12/2021 13:19
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
import { machineId, machineIdSync } from "node-machine-id";
import { createHash } from "crypto";

const id = machineIdSync();
const sha256Hasher = createHash("md5");
const hash = sha256Hasher.update(id).digest("hex");


/** Returns a unique machine id */
export const getMachineID = () => {
    return id
};
/** Returns a unique machine id hashed for pseudonimous use */
export const getHashID = () => {
    return hash;
};

