/* eslint-disable */
const PostHog = require("posthog-node");
import config from "../config";
import { getMachineID } from "../utils/id";
import { version, cpus, platform, totalmem } from "os";
import { screen } from "electron";

const id = getMachineID();
/* We take the host URL from config.ts */
const client = new PostHog(config.posthogApiKey, {
  host: config.posthogHost,
  flushAt: 5,
});

/**
 * Because we can't access screen before the app is ready, we need to wait for it
 * This function need to be called in the main process when app is ready
 */
function onReady(): void {
  const userProps = {
    osVersion: version(),
    os: platform(),
    vCpuNumber: cpus().length,
    cpuModel: cpus()[0].model,
    cpuSpeed: cpus()[0].speed,
    ram: totalmem() / 1024 / 1024 / 1024,
    screen: screen.getPrimaryDisplay().size,
    touchSupport: screen.getPrimaryDisplay().touchSupport,
    screenNumber: screen.getAllDisplays().length,
    appVersion: config.appVersion,
  };
  client.identify({ distinctId: id, properties: userProps });
}
/**
 * A function to send event to posthog
 *
 * @param eventName The name of the event to log (use [noun]-[verb] format like spotlight opened)
 * @param properties An object containing the properties of the event (extension id for example)
 */
function captureEvent(
  eventName: string,
  properties?: {
    [k: string]:
      | string
      | boolean
      | number
      | Record<string, unknown>
      | Array<unknown>;
  }
): void {
  client.capture({
    distinctId: id,
    event: eventName,
    properties: properties,
  });
}
export default captureEvent;
export { onReady };
