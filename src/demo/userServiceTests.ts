import UserService, { LOCAL_USERS_STORE } from "../services/UserService";

export default async function userServiceTests() {
  await UserService.registerNewUser({
    firstName: "sean",
    lastName: "cassiere",
    email: "test@test.com",
    password: "123",
  });

  const locallyStoredUsers = localStorage.getItem(LOCAL_USERS_STORE);
  if (locallyStoredUsers) {
    console.log("Locally stored users\n", JSON.parse(locallyStoredUsers));
  }

  const loginUser = UserService.loginUser({ email: "test@test.com", password: "123" });
  console.log("Logged in user\n", loginUser);
}
