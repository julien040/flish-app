import { Notification, DownloadItem } from "electron";

function downloadHandler(e: Event, downloadItem: DownloadItem): void {
  downloadItem.once("done", (e, state) => {
    if (state === "completed") {
      console.log("Download completed");
      const notification = new Notification({
        title: "Download completed",
        body: `${downloadItem.getFilename()} has been downloaded`,
        silent: true,
      });
      notification.show();
    } else if (state === "cancelled" || state === "interrupted") {
      console.log("Download cancelled");
      const notification = new Notification({
        title: "Download cancelled",
        body: `Can't download ${downloadItem.getFilename()}`,
        silent: true,
      });
      /* Showing the notification. */
      notification.show();
    }
  });
}

export default downloadHandler;
