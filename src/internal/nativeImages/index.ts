import { nativeImage } from "electron";
import { join } from "path";

const nativeImageIcon = {
  error: nativeImage.createFromPath(
    join(__dirname, "../../../assets/", "error.png")
  ),
  info: nativeImage.createFromPath(
    join(__dirname, "../../../assets/", "Flish-Logo128.png")
  ),
};

export default nativeImageIcon;
