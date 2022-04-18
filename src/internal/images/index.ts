import { nativeImage } from "electron";
import { join } from "path";

const nativeImageIcon = {
  error: nativeImage.createFromPath(join(__dirname, "error.png")),
};

export default nativeImageIcon;
