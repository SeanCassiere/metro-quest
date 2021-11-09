import { logger } from "./utils/logger";

interface Location {
  id: string;
  name: String;
}

function populateLocationsData(): Location[] {
  let locations: Location[] = [];
  for (let i = 1; i < 10; i++) {
    const location = {
      id: `${i}`,
      name: `Location ${i}`,
    };
    locations.push(location);
  }
  return locations;
}

export default function mainFunc() {
  logger("Application initialized");

  const locationsRow = document.getElementById("demo-content-row");
  if (locationsRow) {
    const locations = populateLocationsData();
    const locationsHtml = locations.map((location) => {
      return `<div class="col-md-3">
        <div class="card mb-4 shadow-sm">
          <div class="card-body">
            <p class="card-text">${location.name}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div class="btn-group">
                <button type="button" class="btn btn-sm btn-outline-secondary">View</button>
                <button type="button" class="btn btn-sm btn-outline-secondary">Edit</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    });
    locationsRow.innerHTML = locationsHtml.join("");
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
