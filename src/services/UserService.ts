import { clearCookie, setCookie } from "../utils/cookies";
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

interface RegisterUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

class UserService {
  constructor() {}

  getOnlineUsers(): Promise<IUserStore> {
    return new Promise((resolve, reject) => {
      fetch(ALL_USERS_URI)
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem(USER_SERVICE_STORE, JSON.stringify(data));
          resolve(data as IUserStore);
        })
        .catch((e) => {
          console.error(`UserService error (getOnlineUsers)`, e);
          reject([]);
        });
    });
  }

  getAllUsers() {
    const userStore = JSON.parse(localStorage.getItem(USER_SERVICE_STORE) || "{}") as IUserStore;
    const userIds = Array.from(Object.keys(userStore)) as string[];

    const parsedUsers: User[] = [];

    for (let userId of userIds) {
      parsedUsers.push(userStore[userId]);
    }

    return parsedUsers;
  }

  async registerNewUser(props: RegisterUser): Promise<string> {
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
}

export default new UserService();
