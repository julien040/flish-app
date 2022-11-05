function logMessage(
  level: "info" | "warn" | "error" | "debug",
  message: string
): void {
  if (level === "info") {
    console.log(`[${level}] ${message}`);
  } else {
    console.error(`[${level}] ${message}`);
  }
}

export { logMessage };
