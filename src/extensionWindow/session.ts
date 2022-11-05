import captureEvent from "../internal/analytics";

export class Session {
  /** When the extension was fired up */
  private startDate: Date;
  private endDate: Date;
  private extensionID: string;
  /** For security reasons, each sensitive api call is recorded */
  private actions: { type: string; value: string }[];

  constructor(extensionID: string) {
    this.startDate = new Date();
    this.actions = [];
    this.extensionID = extensionID;
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
