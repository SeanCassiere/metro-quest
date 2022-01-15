import { LOCATION_SERVICE_STORE, UUID_URI } from "../constants.js";
import { User } from "./UserService.js";

const ALL_LOCATIONS_URI = "/static/data/locations.json";

interface IComment {
  id: string;
  userId: string;
  userName: string;
  textContent: string;
  date: string;
}

export interface IParentComment extends IComment {
  replies: IComment[];
}

export interface ILocationComments {
  [id: string]: IParentComment;
}

interface IRatingHistory {
  userId: string;
  rating: number;
}

interface ILocationRatings {
  totalRatings: number;
  currentRating: number;
  totalRatingValue: number;
  ratedUsers: string[];
  ratingHistory: IRatingHistory[];
}

export class Location {
  constructor(
    public id: string,
    public name: string,
    public description: string[],
    public mapUri: string,
    public videoUri: string,
    public largeCoverImgUrl: string,
    public ratings: ILocationRatings,
    public comments: ILocationComments
  ) {}
}

interface ILocationStore {
  [locationId: string]: Location;
}

class LocationService {
  constructor() {}

  getOnlineLocations(): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingLocations = JSON.parse(localStorage.getItem(LOCATION_SERVICE_STORE) || "null");

      if (existingLocations) {
        resolve();
        return;
      }

      fetch(ALL_LOCATIONS_URI)
        .then((res) => res.json())
        .then((data) => {
          this.saveLocations(data);

          resolve();
        })
        .catch((e) => {
          console.error(`LocationsServer error (getOnlineLocations)`, e);
          reject();
        });
    });
  }

  private saveLocations(locationsStore: ILocationStore) {
    localStorage.setItem(LOCATION_SERVICE_STORE, JSON.stringify(locationsStore));
  }

  private saveLocation(location: Location) {
    const locations = this.getAllLocationsAsArray();
    const filterLocations = locations.filter((loc) => loc.id !== location.id);
    filterLocations.push(location);
    this.saveLocationsArray(filterLocations);
  }

  private saveLocationsArray(locations: Location[]) {
    const locationsStore: ILocationStore = {};

    locations.forEach((location) => {
      locationsStore[location.id] = location;
    });

    this.saveLocations(locationsStore);
  }

  getAllLocations(): ILocationStore {
    const locationStore = JSON.parse(localStorage.getItem(LOCATION_SERVICE_STORE) || "{}") as ILocationStore;
    return locationStore;
  }

  getAllLocationsAsArray(): Location[] {
    const locationsStore = this.getAllLocations();

    const locationsArray: Location[] = [];

    Object.keys(locationsStore).forEach((locationId) => {
      locationsArray.push(locationsStore[locationId]);
    });

    return locationsArray;
  }

  getLocationById(locationId: string): Location | null {
    const locationsArray = this.getAllLocationsAsArray();

    const findLocation = locationsArray.find((location) => location.id === locationId);

    return findLocation ? findLocation : null;
  }

  getCommentsAsArray(locationId: string): IParentComment[] {
    const location = this.getLocationById(locationId);

    if (!location) return [];

    const comments: IParentComment[] = [];

    Object.keys(location.comments).forEach((commentId) => {
      comments.push(location.comments[commentId]);
    });

    return comments;
  }

  async addComment(user: User, location: Location, { textContent }: { textContent: string }) {
    const newCommentId = await fetch(UUID_URI)
      .then((res) => res.json())
      .then((data) => data.token as string)
      .catch(() => `${Math.floor(Math.random() * 100)}`);

    const newComment: IParentComment = {
      id: newCommentId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      textContent: textContent,
      date: new Date().toISOString(),
      replies: [],
    };

    const updatedLocation = location;
    updatedLocation.comments = { ...updatedLocation.comments, [newComment.id]: newComment };
    this.saveLocation(updatedLocation);
  }

  addRating(locationId: string, user: User | null, rating: number) {
    if (user) {
      let location = this.getLocationById(locationId)!;
      if (location.ratings.ratedUsers.includes(user.id)) {
        return "already_rated";
      }

      let newRating = location.ratings;
      newRating.totalRatings += 1;
      newRating.totalRatingValue += rating;
      newRating.currentRating = newRating.totalRatingValue / newRating.totalRatings;
      newRating.ratedUsers.push(user.id);
      newRating.ratingHistory.push({ userId: user.id, rating: rating });

      location = { ...location, ratings: newRating };

      this.saveLocation(location);
      return "success";
    } else {
      return "not_logged_in";
    }
  }

  updateRating(locationId: string, user: User | null, rating: number) {
    let location = this.getLocationById(locationId);
    if (!user || !location) {
      return;
    }

    if (!location.ratings.ratedUsers.includes(user.id)) {
      return;
    }

    let userRating = location.ratings.ratingHistory.find((historyItem) => historyItem.userId === user.id)!;

    let newRating = location.ratings;
    newRating.totalRatingValue -= userRating.rating;
    newRating.totalRatingValue += rating;
    newRating.currentRating = newRating.totalRatingValue / newRating.totalRatings;
    const historyWithoutExisting = newRating.ratingHistory.filter((historyItem) => historyItem.userId !== user.id);
    newRating.ratingHistory = [...historyWithoutExisting, { userId: user.id, rating: rating }];

    location = { ...location, ratings: newRating };

    this.saveLocation(location);
    return;
  }

  getUserRating(locationId: string, user: User | null) {
    const location = this.getLocationById(locationId);

    if (!user || !location) return 0;

    const history = location.ratings.ratingHistory.find((historyItem) => historyItem.userId === user.id);

    if (!history) return 0;

    return history.rating;
  }

  hasUserRated(locationId: string, user: User | null): boolean {
    if (user) {
      const location = this.getLocationById(locationId)!;
      return location.ratings.ratedUsers.includes(user.id);
    } else {
      return false;
    }
  }

  async addCommentReply(user: User, location: Location, commentId: string, { textContent }: { textContent: string }) {
    const commentUUID = await fetch(UUID_URI)
      .then((res) => res.json())
      .then((data) => data.token as string)
      .catch(() => `${Math.floor(Math.random() * 100)}`);

    const commentReply: IComment = {
      id: commentUUID,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      textContent: textContent,
      date: new Date().toISOString(),
    };

    const parentComment = location.comments[commentId];
    parentComment.replies.push(commentReply);

    const updatedLocation = { ...location, comments: { ...location.comments, [parentComment.id]: parentComment } };

    this.saveLocation(updatedLocation);
  }
}

export default new LocationService();
