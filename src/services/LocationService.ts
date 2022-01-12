import { LOCATION_SERVICE_STORE, UUID_URI } from "../constants.js";
import { User } from "./UserService.js";

const ALL_LOCATIONS_URI = "/static/data/locations.json";

export interface ILocationComments {
  id: string;
  userId: string;
  userName: string;
  textContent: string;
  date: string;
}

interface ILocationRatings {
  totalRatings: number;
  currentRating: number;
  ratedUsers: string[];
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
    public comments: ILocationComments[]
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
          localStorage.setItem(LOCATION_SERVICE_STORE, JSON.stringify({ ...data }));

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

  async addComment(user: User, location: Location, { textContent }: { textContent: string }) {
    const newCommentId = await fetch(UUID_URI)
      .then((res) => res.json())
      .then((data) => data.token as string)
      .catch(() => `${Math.floor(Math.random() * 100)}`);

    const newComment: ILocationComments = {
      id: newCommentId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      textContent: textContent,
      date: new Date().toISOString(),
    };

    const updatedLocation = location;
    updatedLocation.comments.push(newComment);
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
      newRating.currentRating = (newRating.currentRating + rating) / newRating.totalRatings;
      newRating.ratedUsers.push(user.id);

      location = { ...location, ratings: newRating };

      this.saveLocation(location);
      return "success";
    } else {
      return "not_logged_in";
    }
  }

  hasUserRated(locationId: string, user: User | null): boolean {
    if (user) {
      const location = this.getLocationById(locationId)!;
      return location.ratings.ratedUsers.includes(user.id);
    } else {
      return false;
    }
  }
}

export default new LocationService();
