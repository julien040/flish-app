function protocolHandler(
  openUrlInSettings: (url: string) => void,
  openSearchBar: () => void,
  url: string
): void {
  //Remove the protocol from the url
  const path = url.replace("flish://", "");
  if (path.startsWith("settings/")) {
    openUrlInSettings(path.replace("settings/", ""));
  } else {
    openSearchBar();
  }
}

export default protocolHandler;
