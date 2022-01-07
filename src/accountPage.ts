import UserService, { IUpdateUser, User } from "./services/UserService.js";
import {
  normalizeJqueryFormValues,
  SchemaType,
  clearFormErrors,
  validateValues,
  showFormErrors,
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

const schema: SchemaType = {
  firstName: {
    message: "First name is not valid",
    test: function (value: string) {
      return /^.{1,}$/.test(value);
    },
  },
  lastName: {
    message: "Last name is not valid",
    test: function (value: string) {
      return /^.{1,}$/.test(value);
    },
  },
  email: {
    message: "Email is not valid",
    test: function (value: string) {
      return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
    },
  },
  password: {
    message: "Password must be at least 3 characters long",
    test: function (value: any) {
      return /^.{3,}$/.test(value);
    },
  },
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
  $(".show-password").on("click", () => {
    const dataParent = $(".show-password").data("parent");
    const passwordInput = $(`input[name='${dataParent}']`);
    const passwordInputType = passwordInput.attr("type");
    passwordInput.attr("type", passwordInputType === "password" ? "text" : "password");

    const selectCurrentButton = $(`.show-password[data-parent='${dataParent}']`);
    selectCurrentButton.html(
      passwordInputType === "password"
        ? "<i class='fa fa-eye' aria-hidden='true'>"
        : "<i class='fa fa-eye-slash' aria-hidden='true'>"
    );
  });

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
});
