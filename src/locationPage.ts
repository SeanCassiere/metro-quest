import UserService, { User } from "./services/UserService.js";
import LocationService, { ILocationComments } from "./services/LocationService.js";
import {
  normalizeJqueryFormValues,
  validateValues,
  SchemaType,
  showFormErrors,
  clearFormErrors,
} from "./utils/formHelpers.js";
import { timeSince } from "./utils/timeSince.js";

const schema: SchemaType = {
  textContent: (value) => {
    if (!value) {
      return { valid: false, message: "Comment cannot be empty" };
    }
    return { valid: true, message: "Success" };
  },
};

jQuery(() => {
  const loggedInUser = UserService.getLoggedInUser();

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id || id === "") {
    $("#location-content").html(`
      <div class="alert alert-warning" role="alert" style="margin-top: 5em; margin-left: 1em; margin-right: 1em;">
        <p>404 - Location ID not present.</p>
        <p>You need to have a location id to view this page.</p>
        <p>
          <a href="/">Go back to the home page</a>
        </p>
      </div>
    `);
    return;
  }

  const findLocation = LocationService.getLocationById(id);

  if (!findLocation) {
    $("#location-content").html(`
      <div class="alert alert-danger" role="alert" style="margin-top: 5em; margin-left: 1em; margin-right: 1em;">
        <p>404 - Location not found.</p>
        <p>Cannot find a location with this id.</p>
        <p>
          <a href="/">Go back to the home page</a>
        </p>
      </div>
    `);
    return;
  }

  $("#locationTitle").text(`${findLocation.name} | Metro Quest`);
  $("#locationHeader").text(`${findLocation.name}`);
  $("#AboutLoc").text(`${findLocation.name}`);
  $("#Description").text(`${findLocation.description}`);
  $("#locationImage").attr("src", `${findLocation.largeCoverImgUrl}`);
  $("#locVideo").attr("src", `${findLocation.videoUri}`);
  $("#locMap").attr("src", `${findLocation.mapUri}`);

  // setup rating
  $("#rateYo")
    // @ts-ignore: Unreachable code error
    .rateYo({
      precision: 2,
      halfStar: true,
      onInit: (_: number, rateInstance: any) => {
        const updatedLocation = LocationService.getLocationById(findLocation.id)!;
        rateInstance.rating(updatedLocation.ratings.currentRating);
      },
      onChange: (rating: number, rateYoInstance: any) => {
        if (!loggedInUser) {
          window.location.replace(`/login.html?redirect=${window.location.pathname}${window.location.search}`);
          return;
        }
        if (!LocationService.hasUserRated(findLocation.id, loggedInUser)) {
          LocationService.addRating(findLocation.id, loggedInUser, rating);
          window.location.replace(`${window.location.pathname}${window.location.search}`);
          return;
        }
      },
      rating: findLocation.ratings.currentRating,
      readOnly: LocationService.hasUserRated(findLocation.id, loggedInUser),
    });

  // write user comments to DOM
  const comments = findLocation.comments;
  writeCommentsText(comments, loggedInUser);

  // comment form setup
  if (!loggedInUser) {
    $("#comment-form-button-group").html(`
      <a class="btn btn-metro-blue text-white" href="/register.html?redirect=${window.location.pathname}${window.location.search}" size="md">Register</a>
      <a class="btn btn-metro-orange text-white" href="/login.html?redirect=${window.location.pathname}${window.location.search}" size="md">Login</a>
    `);
  }

  if (loggedInUser) {
    $("#commentTextInput").removeAttr("disabled");
    $("#staticCommentName").attr("value", `${loggedInUser.firstName} ${loggedInUser.lastName}`);
  }

  $("form[name='comment-form']").on("submit", async (evt: JQuery.TriggeredEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    const formLocation = LocationService.getLocationById(id)!;

    const formValues = $(evt.target).serializeArray();
    const values = normalizeJqueryFormValues(formValues) as unknown;

    const valid = validateValues(values as { textContent: string }, schema);
    if (!valid.success) {
      showFormErrors("comment-form", valid.errors, valid.validKeys);
      return;
    } else {
      showFormErrors("comment-form", [], valid.validKeys);
    }

    await LocationService.addComment(loggedInUser!, formLocation, values as { textContent: string });
    const updatedLocation = LocationService.getLocationById(id)!;
    writeCommentsText(updatedLocation.comments, loggedInUser);

    // reset the form to the original state
    evt.currentTarget.reset();

    setTimeout(() => {
      clearFormErrors("comment-form");
    }, 1500);
  });
});

const writeCommentsText = (comments: ILocationComments[], loggedInUser: User | null) => {
  let text = "";
  const reversedComments = comments.reverse();

  for (let i = 0; i < reversedComments.length; i++) {
    text += `
    <div class="bg-${
      loggedInUser && reversedComments[i].userId === loggedInUser.id ? "primary" : "secondary"
    } px-3 py-1 border-radius-5 rounded mt-1" style="--bs-bg-opacity: .1; text-align: ${
      loggedInUser && reversedComments[i].userId === loggedInUser.id ? "right" : "left"
    }">
      <p class="comment-item-username">${reversedComments[i].userName}</p>
      <p class="comment-item-comment-date">${timeSince(new Date(reversedComments[i].date))}</p>
      <p class="comment-item-comment-text">${reversedComments[i].textContent}</p>
    </div>
    `;
  }

  $("#location-comments-list").html(text);
};
