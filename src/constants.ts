import { getServerUrls } from "./utils/environment.js";

export const APP_PREFIX = "MQ";
export const UUID_URI_OLD = "https://www.uuidtools.com/api/generate/v4";
export const UUID_URI = getServerUrls().getUUID;

export const USER_SERVICE_STORE = APP_PREFIX + "-local-users";
