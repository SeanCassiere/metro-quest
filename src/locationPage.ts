import UserService, { User } from "./services/UserService.js";
import LocationService, { IParentComment, Location } from "./services/LocationService.js";
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

jQuery(async () => {
  await LocationService.getOnlineLocations();
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
  // $("#locMap").attr("src", `${findLocation.mapUri}`);
  $("#location-map").attr("src", `/map.html?id=${findLocation.id}`);

  // setup rating
  $("#rateYo")
    // @ts-ignore: Unreachable code error
    .rateYo({
      precision: 2,
      halfStar: true,
      rating: LocationService.getUserRating(findLocation.id, loggedInUser),
      onSet: (rating: number, rateYoInstance: any) => {
        if (LocationService.hasUserRated(findLocation.id, loggedInUser)) {
          LocationService.updateRating(findLocation.id, loggedInUser, rating);
        } else {
          LocationService.addRating(findLocation.id, loggedInUser, rating);
        }

        $("#rating-avg").text(
          `Avg. ${LocationService.getLocationById(findLocation.id)?.ratings.currentRating} / 5, Total: ${
            LocationService.getLocationById(findLocation.id)?.ratings.totalRatings
          }`
        );
      },
      onChange: () => {
        if (!loggedInUser) {
          window.location.replace(`/login.html?redirect=${window.location.pathname}${window.location.search}`);
        }
      },
    });

  $("#rating-avg").text(
    `Avg. ${LocationService.getLocationById(findLocation.id)?.ratings.currentRating} / 5, Total: ${
      LocationService.getLocationById(findLocation.id)?.ratings.totalRatings
    }`
  );

  // write user comments to DOM
  writeCommentsText(LocationService.getCommentsAsArray(findLocation.id), loggedInUser, findLocation);

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
    writeCommentsText(LocationService.getCommentsAsArray(id), loggedInUser, findLocation!);

    // reset the form to the original state
    evt.currentTarget.reset();

    setTimeout(() => {
      clearFormErrors("comment-form");
    }, 1500);
  });
});

const writeCommentsText = (comments: IParentComment[], loggedInUser: User | null, currentLocation: Location) => {
  let text = "";
  const reversedComments = comments.reverse();

  for (let i = 0; i < reversedComments.length; i++) {
    let commentText = `
    <div class="bg-secondary px-3 py-1 border-radius-5 rounded mt-1" style="--bs-bg-opacity: .1" id="comment-${
      reversedComments[i].id
    }">
      <div>
        <p class="comment-item-username">${reversedComments[i].userName}</p>
        <p class="comment-item-comment-date">${timeSince(new Date(reversedComments[i].date))}</p>
        <p class="comment-item-comment-text">${reversedComments[i].textContent}</p>
      </div>
      <button class="btn btn-sm reply-button" style="margin-top: -1.5em; padding-left: 0;color: #FB743E; text-decoration: none;" data-parent="${
        reversedComments[i].id
      }">Reply</button>
      `;

    commentText += `
      <div style="">
        <form id="reply-${reversedComments[i].id}" name="reply-form-${reversedComments[i].id}" style="display: none;">
          <div class="row">
            <div class="col-9">
              <input
                type="text"
                class="form-control"
                id="replyTextInput"
                name="textContent"
                placeholder="Reply..."
                autocomplete="off"
              />
              <div id="replyTextInput" class="invalid-feedback"></div>
            </div>
            <div class="col-3">
              <button type="submit" class="btn btn-metro-orange text-white" style="width: 100%">Post</button>
            </div>
          </div>
        </form>
      </div>
      `;

    if (reversedComments[i].replies.length > 0) {
      reversedComments[i].replies.forEach((reply) => {
        commentText += `
        <div style="margin-left: 1em;">
          <p class="comment-item-username">${reply.userName}</p>
          <p class="comment-item-comment-date">${timeSince(new Date(reply.date))}</p>
          <p class="comment-item-comment-text" style="margin-top: -0.45em;">${reply.textContent}</p>
        </div>
        `;
      });
    }

    commentText += "</div>";

    text += commentText;
  }

  $("#location-comments-list").html(text);
  $(`#location-comments-list .reply-button`).on("click", function (evt: JQuery.TriggeredEvent) {
    if (!loggedInUser) {
      window.location.replace(`/login.html?redirect=${window.location.pathname}${window.location.search}`);
      return;
    }
    const parentCommentId = $(this).data("parent");
    const selectReplyForm = $(`#reply-${parentCommentId}`);
    if (selectReplyForm.is(":visible")) {
      selectReplyForm.hide();
    } else {
      selectReplyForm.show();
    }
  });

  reversedComments.forEach((comment) => {
    $(`form#reply-${comment.id}`).on("submit", async function (evt: JQuery.TriggeredEvent) {
      evt.preventDefault();
      evt.stopPropagation();

      const formLocation = LocationService.getLocationById(currentLocation.id)!;
      const formValues = $(evt.target).serializeArray();
      const values = normalizeJqueryFormValues(formValues) as unknown;

      const valid = validateValues(values as { textContent: string }, schema);
      if (!valid.success) {
        showFormErrors(`reply-form-${comment.id}`, valid.errors, valid.validKeys);
        return;
      } else {
        showFormErrors(`reply-form-${comment.id}`, [], valid.validKeys);
      }

      await LocationService.addCommentReply(loggedInUser!, formLocation, comment.id, values as { textContent: string });
      writeCommentsText(LocationService.getCommentsAsArray(currentLocation.id), loggedInUser, currentLocation);

      // reset the form to the original state
      evt.currentTarget.reset();

      setTimeout(() => {
        clearFormErrors(`reply-form-${comment.id}`);
      }, 1500);
    });
  });
};
