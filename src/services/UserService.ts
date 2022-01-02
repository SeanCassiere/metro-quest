const ALL_USERS_URI = "/static/data/users.json";
export const LOCAL_USERS_STORE = "local-users";
export const UUID_URI = "https://www.uuidtools.com/api/generate/v4";

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
          localStorage.setItem(LOCAL_USERS_STORE, JSON.stringify(data));
          resolve(data as IUserStore);
        })
        .catch((e) => {
          console.error(`UserService error (getOnlineUsers)`, e);
          reject([]);
        });
    });
  }

  async registerNewUser(props: RegisterUser) {
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

    let users = JSON.parse(localStorage.getItem(LOCAL_USERS_STORE) || "{}") as IUserStore;
    users = { ...users, [user.id]: user };
    localStorage.setItem(LOCAL_USERS_STORE, JSON.stringify(users));
  }

  loginUser(props: { email: string; password: string }) {
    const userStore = JSON.parse(localStorage.getItem(LOCAL_USERS_STORE) || "{}") as IUserStore;
    const users = Array.from(Object.values(userStore));

    const user = users.find((u) => u.email === props.email.toLowerCase());
    if (user && atob(user.password) === props.password) {
      return user;
    }
    return null;
  }
}

export default new UserService();
