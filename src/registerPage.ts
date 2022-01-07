import UserService, { IRegisterUser } from "./services/UserService.js";
import {
  normalizeJqueryFormValues,
  validateValues,
  SchemaType,
  showFormErrors,
  clearFormErrors,
  showPasswordHandler,
  baseCredentialsSchema,
  baseUserInfoSchema,
} from "./utils/formHelpers.js";
import { dynamicNavbar } from "./services/changeNavbar.js";

const schema: SchemaType = {
  ...baseCredentialsSchema,
  ...baseUserInfoSchema,
  confirmPassword: (value, data) => {
    if (value.length === 0) return { valid: false, message: "Password is required" };

    const isPasswordValid = value === data.password;
    return { valid: isPasswordValid, message: "Both passwords must match" };
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
  showPasswordHandler("registerForm", "show-password");
  showPasswordHandler("registerForm", "show-password-confirm");

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
