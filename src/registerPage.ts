import UserService, { IRegisterUser } from "./services/UserService.js";
import { normalizeJqueryFormValues } from "./utils/formHelpers.js";
import { dynamicNavbar } from "./services/changeNavbar.js";

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
