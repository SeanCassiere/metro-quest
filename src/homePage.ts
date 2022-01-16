import LocationService, { Location } from "./services/LocationService.js";

jQuery(async function () {
  handleReviewsCycling();
  await LocationService.getOnlineLocations();

  let locations = LocationService.getAllLocationsAsArray();
  writeLocationsToDom(locations);

  $(`form[name="home-location-sorting-form"]`).on("submit", searchFormHandler);
  $(`form[name="home-location-sorting-form"] .class-form-input`).on("change", searchFormHandler);
});

function searchFormHandler(evt: JQuery.TriggeredEvent) {
  evt.preventDefault();
  evt.stopPropagation();

  let allLocations = LocationService.getAllLocationsAsArray();
  const searchValue = $(`form[name="home-location-sorting-form"] input[name="search"]`).val() as string;
  const alphabetSortValue = $(`form[name="home-location-sorting-form"] select[name="alphabet"]`).val();
  const ratingSortValue = $(`form[name="home-location-sorting-form"] select[name="rating"]`).val();

  if (searchValue.trim() === "" && alphabetSortValue === "0" && ratingSortValue === "0") {
    writeLocationsToDom(allLocations);
    return;
  }

  if (searchValue.trim().length > 0) {
    allLocations = allLocations.filter((loc) => loc.name.toLowerCase().includes(searchValue.toLowerCase()));
  }

  if (alphabetSortValue === "1") {
    allLocations = allLocations.sort((a, b) => a.name.localeCompare(b.name));
  } else if (alphabetSortValue === "2") {
    allLocations = allLocations.sort((a, b) => b.name.localeCompare(a.name));
  }

  if (ratingSortValue === "1") {
    allLocations = allLocations.sort((a, b) => {
      return a.ratings.currentRating - b.ratings.currentRating;
    });
  } else if (ratingSortValue === "2") {
    allLocations = allLocations.sort((a, b) => {
      return b.ratings.currentRating - a.ratings.currentRating;
    });
  }
  writeLocationsToDom(allLocations);
}

function writeLocationsToDom(locations: Location[]) {
  let locationHtml = "";

  locations.forEach((location) => {
    locationHtml += `
    <div class="col-md-3">
      <div class="card mb-4 shadow-sm">
        <div class="card-body">
          <p class="card-text" style="font-weight: bold">${location.name}</p>
          <img class="homegrid" src="${location.largeCoverImgUrl}" />
          <p class="card-text">
            Rating: ${location.ratings.currentRating} / 5
            <br />
            ${location.description[0].substring(0, 105)}...
          </p>
          <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group">
              <p></p>
              <a href="/location.html?id=${location.id}&refferer=home" class="btn btn-sm btn-outline-secondary">View</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  });

  if (locations.length === 0) {
    locationHtml += `
    <div class="col-md-12">
      <div class="card mb-4 shadow-sm">
        <div class="card-body">
          <p class="card-text" style="font-weight: bold">No results found</p>
          <p class="card-text">
            No results found matching your search.
          </p>
          <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group">
              <p></p>
              <a href="/" class="btn btn-sm btn-outline-secondary">Home</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  }
  jQuery("#home-locations-content").html(locationHtml);
}

function handleReviewsCycling() {
  const reviewDivElements = $('div[id^="review-"]').hide();
  let i = 0;

  (function cycle() {
    reviewDivElements.eq(i).fadeIn(800).delay(1500).fadeOut(800, cycle);

    i = ++i % reviewDivElements.length;
  })();
}
