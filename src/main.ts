import { app, Tray, ipcMain, Menu, globalShortcut } from "electron";
import { InstanceWindow } from "./extensionWindow/instanceWIndow";
import { searchWindow } from "./searchWindow/window";
import { ConfigurationWindow } from "./configurationWindow/window";
import DevModeWindow from "./devModeWindow/devWindow";
import { getConfig } from "./internal/store";
import config from "./config";
import { join, resolve } from "path";
import { onReady } from "./internal/analytics";
import protocolHandler from "./internal/protocolHandler";
import handleSearchInstance from "./internal/searchMode/main";
import * as Sentry from "@sentry/electron";

let configurationWindow: ConfigurationWindow;
let search: searchWindow;
const instanceWindow = new InstanceWindow();
const devModeWindow = new DevModeWindow();
let tray: Tray;
let searchHandler: unknown;

Sentry.init({ dsn: config.sentryDsn });
/* 
Avoid CORS issues when a POST Request is made using a JSON payload.
When sending a post JSON, chrome will first send a preflight request to the server to check if the request is allowed.
However, we can't control header in this preflight request.
So we need to tell chrome to desactivate.
Similar as : https://github.com/electron/electron/issues/20730
*/
app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");
/* app.removeAsDefaultProtocolClient("flish"); */

// ENsure only one instance of the app is running
const isLocked = app.requestSingleInstanceLock();
if (!isLocked) {
  app.quit();
} else {
  app.on("second-instance", (e, argv) => {
    // Only for Windows. Fired when flish is opened with a protocol link
    const url = argv[argv.length - 1];
    protocolHandler(
      configurationWindow.openURL.bind(configurationWindow),
      search.show.bind(search),
      url
    );
  });
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("flish", process.execPath, [
      resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("flish");
}
app.on("ready", async () => {
  onReady();
  configurationWindow = new ConfigurationWindow();
  search = new searchWindow();
  // We don't need more listeners
  ipcMain.setMaxListeners(2);
  ipcMain.on("showSearch", () => search.show());
  ipcMain.on("hideSearch", () => search.hide());
  ipcMain.on("openSettings", () => configurationWindow.show());
  ipcMain.on("closeSettings", () => configurationWindow.hide());
  ipcMain.on("launchInstance", (e, id: string, text: string) => {
    instanceWindow.setQueryString(text);
    instanceWindow.loadInstance(id);
  });
  ipcMain.on("openDevMode", () => devModeWindow.create());
  ipcMain.on("createSearchInstance", (e, type: "dev" | "prod", id?: string) => {
    // In a variable to avoid the function to be called twice
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    searchHandler = handleSearchInstance(
      type,
      id,
      instanceWindow,
      devModeWindow,
      search
    );
  });
  tray = new Tray(
    join(
      __dirname,
      "/../assets/",
      process.platform === "darwin" ? "Tray-macOS.png" : "Flish-Logo64.png" // To have a gray icon on macOS
    )
  );
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

        {
          type: "separator",
        },
        {
          label: "Close development instance",
          type: "normal",
          sublabel: "Close the development instance",
          click: () => devModeWindow.destroy(),
        },
      ],
    },
    {
      type: "separator",
    },
    {
      label: "Quit application",
      type: "normal",
      click: () => {
        tray.destroy();
        globalShortcut.unregisterAll();
        app.exit();
      },
    },
  ]);
  tray.setToolTip("Flish");
  tray.setContextMenu(menu);
  tray.on("click", () => search.show());
  globalShortcut.register(shortcut || "ALT+P", () => search.show());

  if (process.platform === "darwin") {
    app.dock.setIcon(join(__dirname, "/../assets/", "Flish-Logo512.png"));
    app.dock.setMenu(menu);
  }

  /*  
  Last element of process.argv is either a url or a file path.
  If it's a url, we need to open it in the corresponding window.
  If not, we do nothing.
  */
  const argument = process.argv[process.argv.length - 1];
  try {
    const url = new URL(argument);
    // Flish has now a little delay to open the window.
    setTimeout(() => {
      protocolHandler(
        configurationWindow.openURL.bind(configurationWindow),
        search.show.bind(search),
        url.toString()
      );
    }, 800);
  } catch (error) {
    // Not a valid URL
  }
});

app.on("quit", () => {
  tray.destroy();
  globalShortcut.unregisterAll();
  app.exit();
});

app.on("open-url", (e, url) => {
  protocolHandler(configurationWindow.openURL, search.show.bind(search), url);
});
