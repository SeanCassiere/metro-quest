import UserService from "../services/UserService";

export default async function userServiceTests() {
  await UserService.registerNewUser({
    firstName: "sean",
    lastName: "cassiere",
    email: "test@test.com",
    password: "123",
  });

  const locallyStoredUsers = UserService.getAllUsersAsArray();
  if (locallyStoredUsers) {
    console.log("Locally stored users\n", locallyStoredUsers);
  }

  UserService.loginUser({ email: "test@test.com", password: "123" });

  const loggedInUser = UserService.getLoggedInUser();
  console.log("get logged in user", loggedInUser);

  console.log("find user by id", UserService.getUserById(loggedInUser?.id ?? ""));
}
