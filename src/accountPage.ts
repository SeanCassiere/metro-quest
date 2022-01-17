import UserService, { IUpdateUser, User } from "./services/UserService.js";
import LocationService, { Location } from "./services/LocationService.js";
import {
  normalizeJqueryFormValues,
  SchemaType,
  clearFormErrors,
  validateValues,
  showFormErrors,
  showPasswordHandler,
  baseCredentialsSchema,
  baseUserInfoSchema,
  emailCredentialsSchema,
} from "./utils/formHelpers.js";
import { getServerUrls } from "./utils/environment.js";
import { dynamicNavbar } from "./services/changeNavbar.js";
import { CURRENCY } from "./constants.js";

const CLEAR_LOCATION_KEY = "clear-location-id";

function writeInitialUpdateFormValues(loggedInUser: User) {
  const { firstName, lastName, email, password } = loggedInUser;
  const rawValues = {
    firstName,
    lastName,
    email,
    password,
  };

  Array.from(Object.entries(rawValues)).forEach((pair) => {
    if (pair[0] === "password") {
      $(`form[name="updateUserForm"] input[name="${pair[0]}"]`).val(atob(pair[1]));
    } else {
      $(`form[name="updateUserForm"] input[name="${pair[0]}"]`).val(pair[1]);
    }
  });
}

function writeInitialAccountMetadataValues(loggedInUser: User) {
  $("#account-user-full-name").text(`${loggedInUser.firstName} ${loggedInUser.lastName}`);
  $("#account-user-email").text(`${loggedInUser.email}`);
  $("#account-user-points").text(`${CURRENCY}${loggedInUser.userPoints.toFixed(2)}`);
}

function writeFavoriteLocations(locationIds: string[]) {
  let text = "";

  locationIds.forEach((locationId) => {
    const locationData = LocationService.getLocationById(locationId);

    if (locationData) {
      text += `
      <div class="card" style="width: 100%">
        <img src="${locationData.largeCoverImgUrl}" class="card-img-top" alt="..." />
        <div class="card-body">
          <h5 class="card-title">${locationData.name}</h5>
          <a href="/location.html?id=${locationData.id}" class="btn btn-sm btn-metro-orange text-white"
            ><i class="fas fa-eye" aria-hidden="true"></i>View</a
          >
          <button class="btn btn-sm btn-danger clear-listener" data-parent="${locationData.id}" data-bs-toggle="modal" data-bs-target="#clearSingleLocation">
            <i class="fas fa-trash" aria-hidden="true"></i>Clear
          </button>
        </div>
      </div>
      `;
    }
  });

  $("#account-favorite-locations-grid").html(text);
}

function writeRemoveFavLocationListener(loggedInUser: User) {
  const clearListener = jQuery(".clear-listener");
  if (clearListener) {
    clearListener.on("click", function () {
      const existing = sessionStorage.getItem(CLEAR_LOCATION_KEY);
      if (existing) {
        sessionStorage.removeItem(CLEAR_LOCATION_KEY);
      }
      console.log($(this).data("parent"));
      sessionStorage.setItem(CLEAR_LOCATION_KEY, $(this).data("parent"));
    });
  }

  const logoutListener = jQuery(`.clear-button`);
  if (logoutListener) {
    logoutListener.on("click", () => {
      const id = logoutListener.data("parent");
      if (id === "all") {
        UserService.removeAllFavoriteLocations(loggedInUser.id);
      }
      const user = UserService.getUserById(loggedInUser.id)!;
      writeFavoriteLocations(user.favoriteLocations);
    });
  }

  const clearButtonSingle = jQuery(".clear-button-single");
  if (clearButtonSingle) {
    clearButtonSingle.on("click", () => {
      UserService.removeFavoriteLocation(loggedInUser.id, sessionStorage.getItem(CLEAR_LOCATION_KEY)!);
      const user = UserService.getUserById(loggedInUser.id)!;
      writeFavoriteLocations(user.favoriteLocations);
    });
  }
}

const schema: SchemaType = {
  ...baseCredentialsSchema,
  ...baseUserInfoSchema,
};

const emailSchema: SchemaType = {
  ...emailCredentialsSchema,
};

jQuery(() => {
  const loggedInUser = UserService.getLoggedInUser();

  // redirect to login page if the user is not logged in, and providing a callback
  if (!loggedInUser) {
    window.location.replace(`/login.html?redirect=${window.location.pathname}${window.location.search}`);
    return;
  }
  const pageParams = new URLSearchParams(document.location.search);

  // set the correct tab to be shown first based on the URL param (tab)
  const tabValue = pageParams.get("tab");
  if (tabValue && tabValue.toLowerCase() === "favorites") {
    $("#profile-tab").removeClass("active");
    $("#profile-panel").removeClass("show active");
    $("#favorites-tab").addClass("active");
    $("#favorites-panel").addClass("show active");
  }

  // write the user metadata to the page
  $(`#account-user-details`).ready(() => {
    writeInitialAccountMetadataValues(loggedInUser);
  });

  // loading the user data into the form
  $(`form[name="updateUserForm"]`).ready((evt) => {
    writeInitialUpdateFormValues(loggedInUser);
    const userRefreshed = UserService.getLoggedInUser();
    dynamicNavbar(userRefreshed);
  });

  // handle the reset event to reset the user data
  $("#resetUpdateUserForm").on("click", () => {
    clearFormErrors("updateUserForm");
    writeInitialUpdateFormValues(loggedInUser);
    const userRefreshed = UserService.getLoggedInUser();
    dynamicNavbar(userRefreshed);
  });

  // handle the show password button
  showPasswordHandler("updateUserForm", "show-password");

  // handle the update event to update the user data
  $('form[name="updateUserForm"]').on("submit", (evt) => {
    clearFormErrors("updateUserForm");
    evt.preventDefault();

    const formValues = $(evt.target).serializeArray();
    const values = normalizeJqueryFormValues(formValues) as unknown;

    const valid = validateValues(values as IUpdateUser, schema);
    if (!valid.success) {
      showFormErrors("updateUserForm", valid.errors, valid.validKeys);
      return;
    }

    const result = UserService.updateUserDetails(loggedInUser.id, values as IUpdateUser);

    if (result === "duplicate_email") {
      showFormErrors("updateUserForm", [{ property: "email", message: "This email is already in use" }], []);
    } else {
      showFormErrors("updateUserForm", [], valid.validKeys);
      setTimeout(() => {
        clearFormErrors("updateUserForm");
      }, 1500);
    }

    const userRefreshed = UserService.getLoggedInUser();
    writeInitialAccountMetadataValues(userRefreshed!);
    writeInitialUpdateFormValues(userRefreshed!);
    dynamicNavbar(userRefreshed);
  });

  // user favorite locations
  const userFavoriteLocations = loggedInUser.favoriteLocations;
  writeFavoriteLocations(userFavoriteLocations);
  writeRemoveFavLocationListener(loggedInUser);

  $(`form[name="email-favorites-form"] input#favoritesEmailInput`).attr("value", loggedInUser.email);
  $(`form[name="email-favorites-form"]`).on("submit", async (evt: JQuery.TriggeredEvent) => {
    clearFormErrors("email-favorites-form");
    evt.preventDefault();
    evt.stopPropagation();

    const formValues = $(evt.target).serializeArray();
    const values = normalizeJqueryFormValues(formValues) as unknown;

    const valid = validateValues(values as { email: string }, emailSchema);
    if (!valid.success) {
      showFormErrors("email-favorites-form", valid.errors, valid.validKeys);
      return;
    }

    const user = UserService.getLoggedInUser()!;
    let locations: Location[] = [];
    user.favoriteLocations.forEach((locId) => {
      const findLocation = LocationService.getLocationById(locId);
      if (findLocation) {
        locations.push(findLocation);
      }
    });

    $(`form[name="email-favorites-form"] button#close-email-favorites`).prop("disabled", true);
    $(`form[name="email-favorites-form"] button#submit-email-favorites`).prop("disabled", true);

    const host = window.location.protocol + "//" + window.location.host;
    const EMAIL_URL = getServerUrls().sendFavoritesEmail;
    const { email } = values as { email: string };
    await fetch(EMAIL_URL, {
      method: "POST",
      body: JSON.stringify({ locations, recipientEmail: email, name: user.firstName, host: host }),
      headers: { "Content-Type": "application/json" },
    }).finally(() => {
      showFormErrors("email-favorites-form", [], ["email"]);
      setTimeout(() => {
        $(`form[name="email-favorites-form"] button#close-email-favorites`).prop("disabled", false);
        $(`form[name="email-favorites-form"] button#submit-email-favorites`).prop("disabled", false);
        $(`form[name="email-favorites-form"] input#favoritesEmailInput`).removeAttr("value");
        $(`form[name="email-favorites-form"] input#favoritesEmailInput`).attr("value", loggedInUser.email);
        $(`form[name="email-favorites-form"] button#close-email-favorites`).trigger("click");
      }, 2000);
    });
  });
});
