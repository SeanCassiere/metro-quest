import { logger } from "./utils/logger";
export default function mainFunc() {
  logger("Application initialized");
  const demoElem = document.getElementById("js-select");

  if (demoElem) {
    demoElem.innerHTML = "<b>Hello World from Typescript to Javascript conversion</b>";
  }
}

mainFunc();
