import { clearCookie, setCookie, getCookie } from "../utils/cookies";
import { APP_PREFIX, USER_SERVICE_STORE, UUID_URI } from "../constants";

const ALL_USERS_URI = "/static/data/users.json";

class User {
  constructor(
    public id: string,
    public firstName: string,
    public lastName: string,
    public email: string,
    public password: string,
    public favoriteLocations: string[],
    public orders: string[]
  ) {}
}

interface IUserStore {
  [userId: string]: User;
}

interface IRegisterUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface IUpdateUser {
  firstName: string;
  lastName: string;
  email: string;
}

class UserService {
  constructor() {}

  getOnlineUsers(): Promise<IUserStore> {
    return new Promise((resolve, reject) => {
      fetch(ALL_USERS_URI)
        .then((res) => res.json())
        .then((data) => {
          const existingUsers = JSON.parse(localStorage.getItem(USER_SERVICE_STORE) || "null");

          if (existingUsers) {
            localStorage.setItem(USER_SERVICE_STORE, JSON.stringify({ ...existingUsers, ...data }));
          } else {
            localStorage.setItem(USER_SERVICE_STORE, JSON.stringify({ ...data }));
          }
          resolve(data as IUserStore);
        })
        .catch((e) => {
          console.error(`UserService error (getOnlineUsers)`, e);
          reject([]);
        });
    });
  }

  private saveUsersArray(users: User[]) {
    let parsedUsers: IUserStore = {};

    const userIds = Array.from(Object.keys(users));

    for (let id of userIds) {
      const filtered = users.find((u) => u.id === id);
      if (filtered) {
        parsedUsers = { ...parsedUsers, [id]: filtered };
      }
    }

    localStorage.setItem(USER_SERVICE_STORE, JSON.stringify(parsedUsers));
  }

  private saveUsers(userStore: IUserStore) {
    localStorage.setItem(USER_SERVICE_STORE, JSON.stringify(userStore));
  }

  getAllUsersAsArray() {
    const userStore = JSON.parse(localStorage.getItem(USER_SERVICE_STORE) || "{}") as IUserStore;
    const userIds = Array.from(Object.keys(userStore)) as string[];

    const parsedUsers: User[] = [];

    for (let userId of userIds) {
      parsedUsers.push(userStore[userId]);
    }

    return parsedUsers;
  }

  getAllUsers() {
    const userStore = JSON.parse(localStorage.getItem(USER_SERVICE_STORE) || "{}") as IUserStore;
    return userStore;
  }

  getUserById(id: string) {
    const users = this.getAllUsersAsArray();

    const user = users.find((u) => u.id === id);

    return user ?? null;
  }

  async registerNewUser(props: IRegisterUser): Promise<string> {
    const newUserId = await fetch(UUID_URI)
      .then((res) => res.json())
      .then((data) => data[0] as string)
      .catch(() => `${Math.floor(Math.random() * 100)}`);
    const user = new User(
      newUserId,
      props.firstName,
      props.lastName,
      props.email.toLowerCase(),
      btoa(props.password),
      [],
      []
    );

    let users = JSON.parse(localStorage.getItem(USER_SERVICE_STORE) || "{}") as IUserStore;
    users = { ...users, [user.id]: user };
    localStorage.setItem(USER_SERVICE_STORE, JSON.stringify(users));

    return user.id;
  }

  loginUser(props: { email: string; password: string }): User | null {
    const userStore = JSON.parse(localStorage.getItem(USER_SERVICE_STORE) || "{}") as IUserStore;
    const users = Array.from(Object.values(userStore));

    const user = users.find((u) => u.email === props.email.toLowerCase());
    if (user && atob(user.password) === props.password) {
      setCookie(`${APP_PREFIX}-userId`, user.id, 1);
      return user;
    }
    return null;
  }

  logoutUser() {
    clearCookie(`${APP_PREFIX}-userId`);
  }

  getLoggedInUser() {
    const users = this.getAllUsersAsArray();
    const userId = getCookie(`${APP_PREFIX}-userId`);

    const user = users.find((u) => u.id === userId);
    return user ?? null;
  }

  changeCurrentUserPassword(password: string) {
    let allUsers = this.getAllUsers();
    const user = this.getLoggedInUser();

    if (!user) return true;

    user.password = btoa(password);
    allUsers = { ...allUsers, [user.id]: user };

    this.saveUsers(allUsers);
    return true;
  }

  updatedUserDetails(userId: string, details: IUpdateUser) {
    let user = this.getUserById(userId);
    if (!user) return;

    user = { ...user, ...details };

    let allUsers = this.getAllUsers();
    allUsers = { ...allUsers, [user.id]: user };

    this.saveUsers(allUsers);
  }

  addFavoriteLocation(userId: string, locationId: string) {
    let user = this.getUserById(userId);

    if (!user) return;

    user = { ...user, favoriteLocations: [...user.favoriteLocations, locationId] };
    let allUsers = this.getAllUsers();
    allUsers = { ...allUsers, [user.id]: user };

    this.saveUsers(allUsers);
  }

  removeFavoriteLocation(userId: string, locationId: string) {
    let user = this.getUserById(userId);

    if (!user) return true;

    const newFavorites = user.favoriteLocations.filter((id) => id !== locationId);

    const saveUser: User = { ...user, favoriteLocations: newFavorites };

    let allUsers = this.getAllUsers();
    allUsers = { ...allUsers, [user.id]: user };

    this.saveUsers(allUsers);
  }

  addUserOrder(userId: string, orderId: string) {
    let user = this.getUserById(userId);

    if (!user) return;

    user = { ...user, orders: [...user.orders, orderId] };
    let allUsers = this.getAllUsers();
    allUsers = { ...allUsers, [user.id]: user };

    this.saveUsers(allUsers);
  }
}

export default new UserService();
