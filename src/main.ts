import { app, Tray, ipcMain, Menu, globalShortcut } from "electron";
import { InstanceWindow } from "./extensionWindow/instanceWIndow";
import { searchWindow } from "./searchWindow/window";
import { ConfigurationWindow } from "./configurationWindow/window";
import DevModeWindow from "./devModeWindow/devWindow";
import { getConfig } from "./internal/store";
import config from "./config";
import { join } from "path";
import { onReady } from "./internal/analytics";
import * as Sentry from "@sentry/electron";

let configurationWindow: ConfigurationWindow;
let search: searchWindow;
const instanceWindow = new InstanceWindow();
const devModeWindow = new DevModeWindow();
let tray: Tray;

Sentry.init({ dsn: config.sentryDsn });
/* 
Avoid CORS issues when a POST Request is made using a JSON payload.
When sending a post JSON, chrome will first send a preflight request to the server to check if the request is allowed.
However, we can't control header in this preflight request.
So we need to tell chrome to desactivate.
Similar as : https://github.com/electron/electron/issues/20730
*/
app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");

app.on("ready", async () => {
  onReady();
  configurationWindow = new ConfigurationWindow();
  search = new searchWindow();
  ipcMain.on("showSearch", () => search.show());
  ipcMain.on("hideSearch", () => search.hide());
  ipcMain.on("openSettings", () => configurationWindow.show());
  ipcMain.on("closeSettings", () => configurationWindow.hide());
  ipcMain.on("launchInstance", (e, id: string, text: string) => {
    instanceWindow.setQueryString(text);
    instanceWindow.loadInstance(id);
  });
  ipcMain.on("openDevMode", () => devModeWindow.create());
  tray = new Tray(join(__dirname, "64x64.png"));
  const shortcut = await getConfig("shortcut");
  const menu = Menu.buildFromTemplate([
    {
      label: "Search bar",
      type: "normal",
      sublabel: "Open the spotlight like search bar",
      click: () => search.show(),
      accelerator: shortcut || "ALT+P",
    },
    {
      label: "Settings",
      sublabel: "Configure extensions, bookmarks, etc.",
      type: "normal",
      click: () => configurationWindow.show(),
    },
    {
      type: "separator",
    },
    {
      label: "Current instance debugger",
      type: "submenu",
      submenu: [
        {
          label: "Reload",
          type: "normal",
          click: () => {
            instanceWindow.app !== undefined ? instanceWindow.reload() : null;
          },
        },
        {
          label: "Open dev tools",
          type: "normal",
          click: () => {
            instanceWindow.app !== undefined
              ? instanceWindow.openDevTools()
              : null;
          },
        },
      ],
    },
    {
      label: "Developer mode",
      submenu: [
        {
          label: "Open development instance",
          type: "normal",
          sublabel: "Check docs to learn more",
          click: () => devModeWindow.create(),
        },
        {
          type: "separator",
        },
        {
          label: "Refresh extension",
          type: "normal",
          sublabel: "Like F5",
          click: () => devModeWindow.refresh(),
          accelerator: process.platform === "darwin" ? "Cmd+R" : "CTRL+R", //Mac use Cmd and not Ctrl
        },
        {
          label: "Restart instance",
          type: "normal",
          sublabel: "Useful on crash",
          click: () => {
            devModeWindow.create();
          },
        },
        {
          type: "separator",
        },
        {
          label: "Open dev tools in a new window",
          type: "normal",
          click: () => devModeWindow.openDevTools(),
          accelerator:
            process.platform === "darwin" ? "Cmd+Shift+I" : "CTRL+Shift+I", //Mac use Cmd and not Ctrl
        },
        /* {
          type: "separator",
        },
        {
          label: "Close development instance",
          type: "normal",
          sublabel: "Close the development instance",
          click: () => devModeWindow.destroy(),
        }, */
      ],
    },
    {
      type: "separator",
    },
    {
      label: "Quit application",
      type: "normal",
      click: () => {
        tray = null;
        app.exit();
      },
    },
  ]);
  tray.setToolTip("Flish");
  tray.setContextMenu(menu);
  tray.on("click", () => search.show());
  globalShortcut.register(shortcut || "ALT+P", () => search.show());
});
