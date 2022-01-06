import UserService, { IRegisterUser } from "./services/UserService.js";
import { normalizeJqueryFormValues } from "./utils/formHelpers.js";
import { dynamicNavbar } from "./services/changeNavbar.js";

jQuery(() => {
  const loggedInUser = UserService.getLoggedInUser();

  const pageParams = new URLSearchParams(document.location.search);
  const redirectUrl = pageParams.get("redirect");

  // redirect to account page if the user is logged in
  if (loggedInUser) {
    if (redirectUrl && redirectUrl !== "") {
      window.location.replace(`/login.html?redirect=${redirectUrl}`);
      return;
    }
    window.location.replace("/account.html?tab=profile");
    return;
  }

  if (redirectUrl && redirectUrl !== "") {
    $("#register-signin-now-link").attr("href", `/login.html?redirect=${redirectUrl}`);
  }

  $('form[name="registerForm"]')
    .on("submit", async (evt) => {
      $("#registerFormErrorBlock").hide();
      evt.preventDefault();

      const formValues = $(evt.target).serializeArray();
      const values = normalizeJqueryFormValues(formValues) as unknown;

      const register = await UserService.registerNewUser(values as IRegisterUser);
      dynamicNavbar(UserService.getLoggedInUser());

      // checking if the register method returned any known errors
      if (register === "duplicate_email") {
        $("#registerFormErrorBlock").show();
      } else {
        $("#registerFormErrorBlock").hide();

        $("#registerFormErrorBlock")
          .removeClass("alert-warning")
          .addClass("alert-success")
          .text("Successfully registered!")
          .show();

        setTimeout(() => {
          if (redirectUrl && redirectUrl !== "") {
            window.location.replace(`/login.html?redirect=${redirectUrl}`);
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
