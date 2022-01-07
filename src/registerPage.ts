import UserService, { IRegisterUser } from "./services/UserService.js";
import {
  normalizeJqueryFormValues,
  validateValues,
  SchemaType,
  showFormErrors,
  clearFormErrors,
} from "./utils/formHelpers.js";
import { dynamicNavbar } from "./services/changeNavbar.js";

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

  const pageParams = new URLSearchParams(document.location.search);
  const redirectParam = pageParams.get("redirect");

  // redirect to account page if the user is logged in
  if (loggedInUser) {
    if (redirectParam && redirectParam !== "") {
      const redirectNow = window.location.search.split("redirect=")[1];
      window.location.replace(`/login.html?redirect=${redirectNow}`);
      return;
    }
    window.location.replace("/account.html?tab=profile");
    return;
  }

  if (redirectParam && redirectParam !== "") {
    const redirectNow = window.location.search.split("redirect=")[1];
    $("#register-signin-now-link").attr("href", `/login.html?redirect=${redirectNow}`);
  }

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

  $('form[name="registerForm"]')
    .on("submit", async (evt) => {
      clearFormErrors("registerForm");
      $("#registerFormErrorBlock").hide();
      evt.preventDefault();

      const formValues = $(evt.target).serializeArray();
      const values = normalizeJqueryFormValues(formValues) as unknown;

      const valid = validateValues(values as IRegisterUser, schema);
      if (!valid.success) {
        showFormErrors("registerForm", valid.errors, valid.validKeys);
        return;
      }
      const register = await UserService.registerNewUser(values as IRegisterUser);
      dynamicNavbar(UserService.getLoggedInUser());

      // checking if the register method returned any known errors
      if (register === "duplicate_email") {
        showFormErrors("registerForm", [{ property: "email", message: "This email is already in use" }], []);
      } else {
        $("#registerFormErrorBlock").hide();

        $("#registerFormErrorBlock")
          .removeClass("alert-warning")
          .addClass("alert-success")
          .text("Successfully registered!")
          .show();

        setTimeout(() => {
          if (redirectParam && redirectParam !== "") {
            const redirectNow = window.location.search.split("redirect=")[1];
            window.location.replace(`/login.html?redirect=${redirectNow}`);
          } else {
            window.location.replace("/login.html");
          }
        }, 1500);
      }
    })
    .on("click", () => {
      $("#registerFormErrorBlock").hide();
    });
});
