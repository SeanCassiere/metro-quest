import UserService from "../services/UserService";

export default async function userServiceTests() {
  await UserService.registerNewUser({
    firstName: "sean",
    lastName: "cassiere",
    email: "test@test.com",
    password: "123",
  });

  const locallyStoredUsers = UserService.getAllUsers();
  if (locallyStoredUsers) {
    console.log("Locally stored users\n", locallyStoredUsers);
  }

  const loginUser = UserService.loginUser({ email: "test@test.com", password: "123" });
  console.log("Logged in user\n", loginUser);
}
