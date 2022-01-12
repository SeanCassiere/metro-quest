import UserService from "./services/UserService.js";
import LocationService from "./services/LocationService.js";

jQuery(() => {
  const loggedInUser = UserService.getLoggedInUser();

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id || id === "") {
    $("#location-content").html(`
      <div class="alert alert-warning" role="alert" style="margin-top: 5em; margin-left: 1em; margin-right: 1em;">
        <p>404 - Location ID not present.</p>
        <p>You need to have a location id to view this page.</p>
        <p>
          <a href="/">Go back to the home page</a>
        </p>
      </div>
    `);
    return;
  }

  const findLocation = LocationService.getLocationById(id);

  if (!findLocation) {
    $("#location-content").html(`
      <div class="alert alert-danger" role="alert" style="margin-top: 5em; margin-left: 1em; margin-right: 1em;">
        <p>404 - Location not found.</p>
        <p>Cannot find a location with this id.</p>
        <p>
          <a href="/">Go back to the home page</a>
        </p>
      </div>
    `);
    return;
  }

  $("#locationTitle").text(`${findLocation.name} | Metro Quest`);
  $("#locationHeader").text(`${findLocation.name}`);
  $("#AboutLoc").text(`${findLocation.name}`);
  $("#Description").text(`${findLocation.description}`);
  $("#locationImage").attr("src", `${findLocation.largeCoverImgUrl}`);
  $("#locVideo").attr("src", `${findLocation.videoUri}`);
  $("#locMap").attr("src", `${findLocation.mapUri}`);
});
