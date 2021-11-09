import { logger } from "./utils/logger";

export default function mainFunc() {
  logger("Application initialized");
  const demoElem = document.getElementById("js-select");

  if (demoElem) {
    demoElem.innerHTML = "<b>Hello World from Typescript to Javascript conversion</b>";
  }
}

// Load jQuery-3.6.0 from public/static folder
// @deprecated $(document).ready()
// @use $(() => {}) or jQuery(() => {})
// @ref https://github.com/yiisoft/yii2/issues/14620
jQuery(() => {
  console.log("app started from jquery");
  mainFunc();
});
