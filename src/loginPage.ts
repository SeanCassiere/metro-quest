import UserService, { ILoginUser } from "./services/UserService.js";
import {
  normalizeJqueryFormValues,
  validateValues,
  SchemaType,
  showFormErrors,
  clearFormErrors,
} from "./utils/formHelpers.js";
import { dynamicNavbar } from "./services/changeNavbar.js";

const schema: SchemaType = {
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
    clearFormErrors("loginForm");
    evt.preventDefault();
    evt.stopPropagation();

    const formValues = $(evt.target).serializeArray();
    const values = normalizeJqueryFormValues(formValues) as unknown;

    const valid = validateValues(values as ILoginUser, schema);
    if (!valid.success) {
      showFormErrors("loginForm", valid.errors, valid.validKeys);
      return;
    } else {
      showFormErrors("loginForm", [], valid.validKeys);
    }

    const login = UserService.loginUser(values as ILoginUser);
    dynamicNavbar(UserService.getLoggedInUser());

    if (!login) {
      showFormErrors(
        "loginForm",
        [
          { property: "email", message: "Invalid email or password" },
          { property: "password", message: "Invalid email or password" },
        ],
        []
      );
    } else {
      if (redirectParam && redirectParam !== "") {
        const redirectNow = window.location.search.split("redirect=")[1];
        window.location.replace(redirectNow);
      } else {
        window.location.replace("/");
      }
    }
  });
});
