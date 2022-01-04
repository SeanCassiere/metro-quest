import UserService, { IUpdateUser, User } from "./services/UserService";
import { normalizeJqueryFormValues } from "./utils/formHelpers";
import { dynamicNavbar } from "./services/changeNavbar";

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
    $("#account-user-full-name").text(`${loggedInUser.firstName} ${loggedInUser.lastName}`);
    $("#account-user-email").text(`${loggedInUser.email}`);
    $("#account-user-points").text(`${loggedInUser.userPoints}`);
  });

  // loading the user data into the form
  $(`form[name="updateUserForm"]`).ready((evt) => {
    writeInitialUpdateFormValues(loggedInUser);
    const userRefreshed = UserService.getLoggedInUser();
    dynamicNavbar(userRefreshed);
  });

  // handle the reset event to reset the user data
  $("#resetUpdateUserForm").on("click", () => {
    writeInitialUpdateFormValues(loggedInUser);
    const userRefreshed = UserService.getLoggedInUser();
    dynamicNavbar(userRefreshed);
  });

  // handle the update event to update the user data
  $('form[name="updateUserForm"]').on("submit", (evt) => {
    evt.preventDefault();

    const formValues = $(evt.target).serializeArray();
    const values = normalizeJqueryFormValues(formValues) as unknown;

    const result = UserService.updateUserDetails(loggedInUser.id, values as IUpdateUser);
    const selectAlertBlock = $("#updateFormErrorBlock");

    if (result === "duplicate_email") {
      selectAlertBlock.addClass("alert-warning").text("This email is already in use").show();
      setTimeout(() => {
        selectAlertBlock.hide().removeClass("alert-warning");
      }, 1500);
    } else {
      selectAlertBlock.addClass("alert-success").text("Successfully updated!").show();
      setTimeout(() => {
        selectAlertBlock.hide().removeClass("alert-success");
      }, 1500);
    }

    const userRefreshed = UserService.getLoggedInUser();
    writeInitialUpdateFormValues(userRefreshed!);
    dynamicNavbar(userRefreshed);
  });
});
