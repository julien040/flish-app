function protocolHandler(
  openUrlInSettings: (url: string) => void,
  openSearchBar: () => void,
  url: string
): void {
  //Remove the protocol from the url
  const path = url.replace("flish://", "");
  console.log(path);
  if (path.startsWith("settings/")) {
    console.log(true);
    openUrlInSettings(path.replace("settings/", ""));
  } else {
    openSearchBar();
  }
}

export default protocolHandler;
