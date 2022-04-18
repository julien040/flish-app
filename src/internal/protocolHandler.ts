import { createInstance } from "./instance/create";
import { getExtension } from "./extension/read";
import { logMessage } from "./logging/logging";
import { updateEnvVariables } from "./instance/types";

function protocolHandler(
  openUrlInSettings: (url: string) => void,
  openSearchBar: () => void,
  url: string
): void {
  //Remove the protocol from the url
  const path = url.replace("flish://", "");

  const firstElement = path.split("/")[0];
  const secondElement = path.split("/")[1];
  console.log("URL :", firstElement, secondElement);

  switch (firstElement) {
    case "settings":
      // Now, this is up to configurationWindow to handle the url
      openUrlInSettings(path.replace("settings/", ""));
      break;
    case "profile":
      if (secondElement.startsWith("new")) {
        createInstanceFromProtocol(path.replace("profile/new", "")).catch((e) =>
          logMessage("error", e.message)
        );
      }
      break;
    default:
      // If the query is anything else than the other cases, we open the search bar
      openSearchBar();
      break;
  }
}

async function createInstanceFromProtocol(uvString: string): Promise<void> {
  const params = new URLSearchParams(uvString);
  const id = params.get("id");
  const name = params.get("name");
  const envStringified = params.get("object");

  let envVariableFromParsing: unknown = null;

  // Check if arguments are valid
  if (!id) {
    throw new Error("No id provided in the search parameter");
  }
  if (!name) {
    throw new Error("No name provided in the search parameter");
  }

  if (envStringified) {
    envVariableFromParsing = JSON.parse(envStringified) as Record<
      string,
      unknown
    >;

    if (typeof envVariableFromParsing !== "object") {
      throw new Error("The env variable is not an object");
    }
  } else {
    envVariableFromParsing = {};
  }

  const extension = await getExtension(id);
  const envVariable = [] as updateEnvVariables[];

  if (envVariableFromParsing) {
    for (let index = 0; index < extension.envVariables.length; index++) {
      const element = extension.envVariables[index];
      if (
        Object.prototype.hasOwnProperty.call(
          envVariableFromParsing,
          element.name
        )
      ) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - We know that the type of envVariableFromParsing is object. We already checked if it has the property.
        const value = envVariableFromParsing[element.name];

        envVariable.push({
          name: element.name,
          value: value,
          needToBeEncrypted: element.needToBeEncrypted,
        });
      } else {
        envVariable.push({
          name: element.name,
          value: " ",
          needToBeEncrypted: element.needToBeEncrypted,
        });
      }
    }
  }

  await createInstance(id, {
    name: name,
    envVariable: envVariable,
  });
}

export default protocolHandler;
