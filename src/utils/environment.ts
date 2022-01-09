function getCurrentEnvironment() {
  return window.location.host.includes("localhost") ? "development" : "production";
}

const PORT = 4500;

const serverUrls = {
  getUUID: "/api/UUID",
  getStripeKey: "/api/StripeKey",
};

export function getServerUrls() {
  const env = getCurrentEnvironment();

  if (env === "production") {
    return serverUrls;
  }

  const urlEntries = Array.from(Object.entries(serverUrls));
  const returnObject = urlEntries.reduce((prev, entry) => {
    const [key, value] = entry;
    prev = { [key]: `http://localhost:${PORT}${value}`, ...prev };
    return prev;
  }, {});

  return returnObject;
}
