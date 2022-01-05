import UserService, { User } from "./UserService.js";

export function dynamicNavbar(user: User | null) {
  const primaryItemsSelector = jQuery("#primary-nav-items");
  const secondaryItemsSelector = jQuery("#secondary-nav-items");
  const logoutModalSelector = jQuery("#logout-modal");

  if (logoutModalSelector) {
    logoutModalSelector.html(stringLogoutModal(user));
  }

  if (primaryItemsSelector) {
    primaryItemsSelector.html(stringPrimaryNavItems(user));
  }

  if (secondaryItemsSelector) {
    secondaryItemsSelector.html(stringSecondaryNavItems(user));
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
  const currentPath = window.location.pathname.toLowerCase();

  const isLoginPath = currentPath.includes("login");
  const isRegisterPath = currentPath.includes("register");
  const isAccountPath = currentPath.includes("account");

  if (user) {
    return `

    <li class="nav-item">
      <a class="nav-link pe-2 ${isAccountPath && "active"}" aria-current="page" href="/account.html?tab=profile">Hi, ${
      user.firstName
    }</a>
    </li>
    <li class="nav-item">
      <a class="nav-link " href="#" data-bs-toggle="modal" data-bs-target="#logoutStaticBackdrop" style="padding-left: 0.5rem;"><i class="fa fa-sign-out" aria-hidden="true"></i></a>
    </li>

    `;
  }

  return `
  
  <li class="nav-item">
    <a class="nav-link pe-2 ${isLoginPath && "active"}" aria-current="page" href="/login.html">Login</a>
  </li>
  <li class="nav-item">
    <a class="nav-link ${isRegisterPath && "active"}" href="/register.html">Sign Up</a>
  </li>

  `;
}

function stringLogoutModal(user: User | null) {
  if (user) {
    return `

    <!-- Logout User Modal -->
    <div
      class="modal fade"
      id="logoutStaticBackdrop"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-labelledby="logoutStaticBackdropLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered" style="z-index: 100;">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="logoutStaticBackdropLabel">Logout?</h5>
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

function stringSecondaryNavItems(user: User | null) {
  const currentPath = window.location.pathname.toLowerCase() + window.location.search.toLowerCase();

  const isHomePath = currentPath === "/" || currentPath.includes("index");
  const isAccountProfile = currentPath.includes("tab=profile");
  const isAccountFavorites = currentPath.includes("tab=favorites");

  let defaultNavItems = `

  <li class="nav-item">
    <a class="nav-link secondary-nav-item ${isHomePath && "active"}" aria-current="page" href="/">
      <i class="fa fa-home secondary-nav-item-text-icon" aria-hidden="true"></i>
      <span class="secondary-nav-item-text-content">Home</span>
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link secondary-nav-item" aria-current="page" href="/">
      <i class="fa fa-qrcode secondary-nav-item-text-icon" aria-hidden="true"></i>
      <span class="secondary-nav-item-text-content">Scan QR Code</span>
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link secondary-nav-item" aria-current="page" href="/">
      <i class="fa fa-calendar secondary-nav-item-text-icon" aria-hidden="true"></i>
      <span class="secondary-nav-item-text-content">Book a trip</span>
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link secondary-nav-item ${isAccountFavorites && "active"}" href="/account.html?tab=favorites">
      <i class="fa fa-list-ul secondary-nav-item-text-icon" aria-hidden="true"></i>
      <span class="secondary-nav-item-text-content">Favorites</span>
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link secondary-nav-item ${isAccountProfile && "active"}" href="/account.html?tab=profile">
      <i class="fa fa-user secondary-nav-item-text-icon" aria-hidden="true"></i>
      <span class="secondary-nav-item-text-content">My Account</span>
    </a>
  </li>

  `;

  if (user) {
    defaultNavItems += `
    
    <li class="nav-item">
      <a class="nav-link secondary-nav-item" href="#e">
        <i class="fa fa-sign-out secondary-nav-item-text-icon" aria-hidden="true"></i>
        <span class="secondary-nav-item-text-content" data-bs-toggle="modal" data-bs-target="#logoutStaticBackdrop">Logout</span>
      </a>
    </li>

    `;
  }

  return defaultNavItems;
}
