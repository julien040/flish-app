import { machineIdSync } from "node-machine-id";
import { createHash } from "crypto";

const id = machineIdSync();
const sha256Hasher = createHash("md5");
const hash = sha256Hasher.update(id).digest("hex");

/** Returns a unique machine id */
export const getMachineID = (): string => {
  return id;
};
/** Returns a unique machine id hashed for pseudonimous use */
export const getHashID = (): string => {
  return hash;
};
