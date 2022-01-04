import UserService, { ILoginUser } from "./services/UserService";
import { normalizeJqueryFormValues } from "./utils/formHelpers";
import { dynamicNavbar } from "./services/changeNavbar";

jQuery(() => {
  const loggedInUser = UserService.getLoggedInUser();

  // redirect to account page if the user is logged in
  if (loggedInUser) {
    window.location.replace("/account.html?tab=profile");
  }

  $('form[name="loginForm"]').on("submit", (evt) => {
    $("#loginFormErrorBlock").hide();
    evt.preventDefault();
    evt.stopPropagation();

    const formValues = $(evt.target).serializeArray();
    const values = normalizeJqueryFormValues(formValues) as unknown;

    const login = UserService.loginUser(values as ILoginUser);
    dynamicNavbar(UserService.getLoggedInUser());

    if (!login) {
      $("#loginFormErrorBlock").show();
      console.log(login);
    } else {
      $("#loginFormErrorBlock").hide();

      const pageParams = new URLSearchParams(document.location.search);

      const redirectUrl = pageParams.get("redirect");

      if (redirectUrl && redirectUrl !== "") {
        window.location.replace(redirectUrl);
      } else {
        window.location.replace("/");
      }
    }
  });
});
