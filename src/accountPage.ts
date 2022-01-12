import UserService, { IUpdateUser, User } from "./services/UserService.js";
import LocationService from "./services/LocationService.js";
import {
  normalizeJqueryFormValues,
  SchemaType,
  clearFormErrors,
  validateValues,
  showFormErrors,
  showPasswordHandler,
  baseCredentialsSchema,
  baseUserInfoSchema,
} from "./utils/formHelpers.js";
import { dynamicNavbar } from "./services/changeNavbar.js";

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
  $("#account-user-points").text(`${loggedInUser.userPoints}`);
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
          <button class="btn btn-sm btn-danger clear-button" data-parent="${locationData.id}">
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
  const logoutListener = jQuery(`.clear-button`);
  if (logoutListener) {
    logoutListener.on("click", () => {
      const id = logoutListener.data("parent");
      if (id === "all") {
        UserService.removeAllFavoriteLocations(loggedInUser.id);
      } else {
        UserService.removeFavoriteLocation(loggedInUser.id, id);
      }
      const user = UserService.getUserById(loggedInUser.id)!;
      writeFavoriteLocations(user.favoriteLocations);
    });
  }
}

const schema: SchemaType = {
  ...baseCredentialsSchema,
  ...baseUserInfoSchema,
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
});
