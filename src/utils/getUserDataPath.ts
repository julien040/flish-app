import getAppDataPath from "appdata-path";
import config from "../config";

const userDataPath = getAppDataPath(config.appName);

export default userDataPath;
