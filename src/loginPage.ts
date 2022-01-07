import UserService, { ILoginUser } from "./services/UserService.js";
import { normalizeJqueryFormValues } from "./utils/formHelpers.js";
import { dynamicNavbar } from "./services/changeNavbar.js";

jQuery(() => {
  const loggedInUser = UserService.getLoggedInUser();

  // redirect to account page if the user is logged in
  const pageParams = new URLSearchParams(document.location.search);

  const redirectParam = pageParams.get("redirect");

  if (loggedInUser) {
    if (redirectParam && redirectParam !== "") {
      const redirectNow = window.location.search.split("redirect=")[1];
      window.location.replace(redirectNow);
      return;
    }
    window.location.replace("/account.html?tab=profile");
    return;
  }

  if (redirectParam && redirectParam !== "") {
    const redirectNow = window.location.search.split("redirect=")[1];
    $("#login-signup-now-link").attr("href", `/register.html?redirect=${redirectNow}`);
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
    } else {
      $("#loginFormErrorBlock").hide();

      if (redirectParam && redirectParam !== "") {
        const redirectNow = window.location.search.split("redirect=")[1];
        window.location.replace(redirectNow);
      } else {
        window.location.replace("/");
      }
    }
  });
});
