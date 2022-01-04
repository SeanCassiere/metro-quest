import UserService, { IRegisterUser } from "./services/UserService.js";
import { normalizeJqueryFormValues } from "./utils/formHelpers.js";
import { dynamicNavbar } from "./services/changeNavbar.js";

jQuery(() => {
  const loggedInUser = UserService.getLoggedInUser();

  // redirect to account page if the user is logged in
  if (loggedInUser) {
    window.location.replace("/account.html?tab=profile");
  }

  $('form[name="registerForm"]')
    .on("submit", async (evt) => {
      $("#registerFormErrorBlock").hide();
      evt.preventDefault();

      const formValues = $(evt.target).serializeArray();
      const values = normalizeJqueryFormValues(formValues) as unknown;

      const register = await UserService.registerNewUser(values as IRegisterUser);
      dynamicNavbar(UserService.getLoggedInUser());

      if (register === "duplicate_email") {
        $("#registerFormErrorBlock").show();
        console.log(register);
      } else {
        $("#registerFormErrorBlock").hide();

        const pageParams = new URLSearchParams(document.location.search);

        const redirectUrl = pageParams.get("redirect");

        if (redirectUrl && redirectUrl !== "") {
          $("#registerFormErrorBlock")
            .removeClass("alert-warning")
            .addClass("alert-success")
            .text("Successfully registered!")
            .show();

          window.location.replace(redirectUrl);
        } else {
          $("#registerFormErrorBlock")
            .removeClass("alert-warning")
            .addClass("alert-success")
            .text("Successfully registered!")
            .show();

          setTimeout(() => {
            window.location.replace("/login.html");
          }, 1500);
        }
      }
    })
    .on("click", () => {
      $("#registerFormErrorBlock").hide();
    });
});
