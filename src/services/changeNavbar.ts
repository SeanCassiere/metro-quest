import UserService, { User } from "./UserService";

export function dynamicNavbar(user: User | null) {
  const primaryItems = jQuery("#primary-nav-items");

  if (primaryItems) {
    if (user) {
      primaryItems.html(`
        <li class="nav-item">
        <a class="nav-link pe-2" aria-current="page" href="/account.html?tab=profile">Account</a>
        </li>
        <li class="nav-item">
        <a class="nav-link" href="#" id="logout-click">Log Out</a>
        </li>
        `);
    } else {
      primaryItems.html(`
      <li class="nav-item">
        <a class="nav-link pe-2" aria-current="page" href="/login.html">Login</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="/register.html">Sign Up</a>
      </li>
      `);
    }
  }

  const logoutListener = jQuery("#logout-click");
  if (logoutListener) {
    logoutListener.on("click", () => {
      UserService.logoutUser();
      dynamicNavbar(UserService.getLoggedInUser());
      window.location.replace("/");
    });
  }
}

function javaScriptImplementation() {
  // const primaryItems = document.getElementById("primary-nav-items");
  // if (primaryItems) {
  //   if (user) {
  //     primaryItems.innerHTML = `
  //     <li class="nav-item">
  //       <a class="nav-link pe-2" aria-current="page" href="#">Account</a>
  //     </li>
  //     <li class="nav-item">
  //       <a class="nav-link" href="#" id="logout-click">Log Out</a>
  //     </li>
  //     `;
  //   } else {
  //     primaryItems.innerHTML = `
  //     <li class="nav-item">
  //       <a class="nav-link pe-2" aria-current="page" href="#">Login</a>
  //     </li>
  //     <li class="nav-item">
  //       <a class="nav-link" href="#">Sign Up</a>
  //     </li>
  //     `;
  //   }
  // }
  // const logoutListener = document.getElementById("logout-click");
  // if (logoutListener) {
  //   logoutListener.addEventListener("click", () => {
  //     UserService.logoutUser();
  //     dynamicNavbar(UserService.getLoggedInUser());
  //   });
  // }
}
