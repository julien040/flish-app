export interface envVariables {
  /** In the form, name will be the label. Also, it will be the identifier when an extension call the env variable API */
  name: string;
  /** In the form, this will influence appearance (using a checkbox e.g.). Default to string */
  type?: "string" /* | "number" | "boolean"; */;
  /** If required, user can't skip the input. Label will have a small red star */
  /* required?: boolean; */
  /** What would be shown below the input */
  description?: string;
  /** A default value to fallback if no input. If not specified in boolean, fallback to false */
  defaultValue?: string | number | boolean;
  /** In case of "number" or "string", the placeholder is what would be shown in the input until nothing is written */
  placeholder?: string;
  /** If set to true, value will be saved in keychain (or platform equivalent for linux or windows) */
  needToBeEncrypted: boolean;
}

export interface extension {
  /** The Unique ID of the extension generated by the server */
  uuid: string;
  /** The name of the extension */
  name: string;
  /** The description of the extension */
  description: string;
  /** The version of the extension */
  version: string;
  /** URL to zip of extension */
  downloadURL: string;
  /** Hash over extension files  */
  hash?: string;
  /** Absolute path to the extension */
  path: string;
  /** The mode of the app | search => app is shown and search bar too, normal => on enter pressed, focus is given to extension and search bar disappear, noArgument => when choosen, no argument could be given */
  mode?: "search" | "normal" | "noArgument" | "headless";
  /** The HTML file name to load in the window. Useful when differs from index.html */
  entry?: string;
  /** The icon of the extension. Could be an HTTP URL, or a local path */
  icon: string;
  /** Permissions required by the extension. Specify the capabilities of the extension (could be empty)  */
  permissions: (
    | "notifications"
    | "clipboard"
    | "geolocation"
    | "media"
    | "fs"
  )[];
  /** Array of environment Variable required by the extension. User will be prompt answering them (could be empty) */
  envVariables: envVariables[];
  /** If the extension is premium. Not available now */
  premium?: boolean;
  /** Placeholder in the search bar when query */
  placeholder?: string;
  /** A small text explaining what should be typed (in markdown) */
  README: string;
  /** A link to a tutorial to see how to use the extension */
  tutorial: string;
  /** A link to open the extension page in settings */
  link: string;
  /** Some metadata about the extension */
  metadata?: Record<string, string | boolean | number>;
}
