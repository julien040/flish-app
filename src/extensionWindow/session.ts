import { screen } from "electron";
import { getMachineID } from "../utils/id";
import captureEvent from "../internal/analytics";

export class Session {
  /** When the extension was fired up */
  private startDate: Date;
  private endDate: Date;
  /** Hashed value of user id */
  private userID: string;
  private extensionID: string;
  /** For security reasons, each sensitive api call is recorded */
  private actions: { type: string; value: string }[];
  private screenSize =
    screen.getPrimaryDisplay().size.height +
    "x" +
    screen.getPrimaryDisplay().size.width;
  private platform = process.platform;

  constructor(extensionID: string, userId = getMachineID()) {
    this.startDate = new Date();
    this.actions = [];
    this.extensionID = extensionID;
    this.userID = userId;
  }
  public addAction(type: string, value: string): void {
    this.actions.push({ type, value });
  }
  public closeSession(): void {
    this.endDate = new Date();
    this.sendData();
  }
  private sendData() {
    captureEvent("Extension Session ended", {
      extensionID: this.extensionID,
      start: this.startDate.toDateString(),
      end: this.endDate.toDateString(),
      actions: this.actions,
    });
  }
}
