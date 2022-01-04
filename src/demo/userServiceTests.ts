import UserService from "../services/UserService.js";

export default async function userServiceTests() {
  // await UserService.registerNewUser({
  //   firstName: "sean",
  //   lastName: "cassiere",
  //   email: "a@a.com",
  //   password: "123",
  // });

  // const locallyStoredUsers = UserService.getAllUsersAsArray();
  // if (locallyStoredUsers) {
  //   console.log("Locally stored users\n", locallyStoredUsers);
  // }

  // UserService.loginUser({ email: "example@example.com", password: "123" });

  const loggedInUser = UserService.getLoggedInUser();
  // console.log("get logged in user", loggedInUser);

  if (loggedInUser) {
    // User points
    // UserService.addPointsToUser(loggedInUser.id, 10);
    // console.log("user with points added", UserService.getLoggedInUser());
    /** */
    // Log out user
    // UserService.logoutUser();
  }

  // console.log("find user by id", UserService.getUserById(loggedInUser?.id ?? ""));
}
