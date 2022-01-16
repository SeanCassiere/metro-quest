import UserService from "./services/UserService.js";
import LocationService from "./services/LocationService.js";

import { dynamicNavbar } from "./services/changeNavbar.js";
// import { logger } from "./utils/logger.js";

export default async function mainFunc() {
  await LocationService.getOnlineLocations();
  await UserService.getOnlineUsers();

  dynamicNavbar(UserService.getLoggedInUser());
}

// Load jQuery-3.6.0 from public/static folder
// @deprecated $(document).ready()
// @use $(() => {}) or jQuery(() => {})
// @ref https://github.com/yiisoft/yii2/issues/14620
jQuery(() => {
  mainFunc();
});
