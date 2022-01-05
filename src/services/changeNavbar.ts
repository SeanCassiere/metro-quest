import UserService, { User } from "./UserService.js";

export function dynamicNavbar(user: User | null) {
  const primaryItemsSelector = jQuery("#primary-nav-items");
  const logoutModal = jQuery("#logout-modal");

  if (logoutModal) {
    console.log("logoutModal", logoutModal);
    logoutModal.html(stringLogoutModal(user));
  }

  if (primaryItemsSelector) {
    primaryItemsSelector.html(stringPrimaryNavItems(user));
  }

  // event listener for the logout confirmation call
  const logoutListener = jQuery("#logout-click");
  if (logoutListener) {
    logoutListener.on("click", () => {
      UserService.logoutUser();
      dynamicNavbar(UserService.getLoggedInUser());
      window.location.replace("/");
    });
  }
}

function stringPrimaryNavItems(user: User | null) {
  if (user) {
    return `

    <li class="nav-item">
      <a class="nav-link pe-2" aria-current="page" href="/account.html?tab=profile">Hi, ${user.firstName}</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#staticBackdrop" style="padding-left: 0.5rem;"><i class="fa fa-sign-out" aria-hidden="true"></i></a>
    </li>

    `;
  }

  return `
  
  <li class="nav-item">
    <a class="nav-link pe-2" aria-current="page" href="/login.html">Login</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="/register.html">Sign Up</a>
  </li>

  `;
}

function stringLogoutModal(user: User | null) {
  if (user) {
    return `

    <!-- Logout User Modal -->
    <div
      class="modal fade"
      id="staticBackdrop"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered" style="z-index: 100;">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Logout?</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
            <div class="modal-body">
              <span>Are you sure you want to logout?</span>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-metro-blue" data-bs-dismiss="modal">Dismiss</button>
              <button type="button" class="btn btn-metro-orange text-white" data-bs-dismiss="modal" id="logout-click">Logout</button>
            </div>
        </div>
      </div>
    </div>

    `;
  }

  return "";
}
