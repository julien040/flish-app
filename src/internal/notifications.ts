import { Notification } from "electron";

function notifyError(error: string): void {
  const notification = new Notification({
    title: "Error",
    body: error,
    silent: true,
  });
  notification.show();
}

export { notifyError };
