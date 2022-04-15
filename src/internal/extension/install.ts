import { extension } from "./types";
import config from "../../config";
import { join } from "path";
import https = require("https");
import axios from "axios";
//eslint-disable-next-line @typescript-eslint/no-var-requires
const unzipper = require("unzipper");
import { setConfig } from "../store";
import userDataPath from "../../utils/getUserDataPath";
import captureEvent from "../analytics";

/**
* Description : Install an extension from an api specified in the config file
* 
* @param uuid The unique id of the extension from the api
* @param callback A function explaining the status of the installation (Possible values : **"Waiting API", "Manifest fetched", "Downloading", "Installed"**)
* @param path The path where the extension will be installed (optional)
* Example : 
 * ```typescript
 await installExtension("656454sd5f4s5", callback, "C://Users/Loki/Desktop/");
```
*/
export const installExtension = async (
  uuid: string,
  callback?: (info: string) => void,
  path?: string
): Promise<void> => {
  // Get the extension from the api
  const urlManifest = config.extensionApiURL + uuid;
  if (!callback) {
    //In case no callback has been given
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    callback = (): void => {};
  }
  callback("Waiting API");
  const { data } = await axios.get<extension>(urlManifest);
  callback("Manifest Fetched"); //Return the folder where the data for the application is stored. It's an electron feature
  let folderToExtract: string; //In case no path has been given, we will use the default one (userPath/extensions/{uuid})
  if (!path) {
    folderToExtract = join(userDataPath, "extensions", uuid);
  } else {
    folderToExtract = path;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  https.get(data.downloadURL, (res: any) => {
    //Make an https request to the download url. The response should always be a zip file
    callback("Downloading");
    const extractor = res.pipe(unzipper.Extract({ path: folderToExtract })); //Transform the response into a stream and extract it in the folderToExtract. The unzipper module is used to extract the zip file. Using a stream is more efficient and clear than putting file into the memory.
    extractor.on("finish", async () => {
      //When the extraction is finished, we will set the config of the extension
      await setConfig(`extensions.${uuid}`, { ...data, path: folderToExtract });
      callback("Installed");
    });
  });
  captureEvent("Extension Installed", { extensionID: uuid });
  await new Promise((resolve) => {
    resolve("Installed");
  });
};
