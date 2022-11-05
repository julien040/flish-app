import { Notification, DownloadItem, shell } from "electron";

function downloadHandler(e: Event, downloadItem: DownloadItem): void {
  // Because of a weird memory leak issue, we need to remove any listener at the start of a download
  downloadItem.removeAllListeners("done");
  downloadItem.once("done", (e, state) => {
    if (state === "completed") {
      const notification = new Notification({
        title: "Download completed",
        body: `${downloadItem.getFilename()} has been downloaded`,
        silent: true,
      });
      notification.once("click", () => {
        shell.showItemInFolder(downloadItem.getSavePath());
      });
      notification.show();
    } else if (state === "interrupted") {
      const notification = new Notification({
        title: "Download interrupted",
        body: `Can't download ${downloadItem.getFilename()}`,
        silent: true,
      });
      /* Showing the notification. */
      notification.show();
    }
  });
}

export default downloadHandler;
