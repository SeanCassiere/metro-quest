import LocationService, { Location } from "./services/LocationService.js";
import { getServerUrls } from "./utils/environment.js";
import UserService from "./services/UserService.js";
import { dynamicNavbar } from "./services/changeNavbar.js";

declare global {
  interface Date {
    toDateInputValue(): string;
    toTimeInputValue(): string;
  }
}

jQuery(() => {
  const loggedInUser = UserService.getLoggedInUser();
  if (!loggedInUser) {
    window.location.replace(`/login.html?redirect=${window.location.pathname}${window.location.search}`);
    return;
  }
  if (loggedInUser) {
    $("#bookingFirstNameInput").val(loggedInUser.firstName);
    $("#bookingLastNameInput").val(loggedInUser.lastName);
    $("#bookingEmailInput").val(loggedInUser.email);
    if (loggedInUser.userPoints <= 0) {
      $("input#bookingPromotionCodeInput").prop("readonly", true);
    }
    $("input#bookingPromotionCodeInput").val(loggedInUser.userPoints.toFixed(2));
  }
  Date.prototype.toDateInputValue = function () {
    const local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
  };
  Date.prototype.toTimeInputValue = function () {
    const local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(11, 16);
  };
  $("input#bookingDepartureDateInput").val(new Date().toDateInputValue());
  $("input#bookingDepartureTimeInput").val(new Date().toTimeInputValue());
});

//From
$("#checkoutSubmit").click(function () {
  var from = $("#bookingFromInput").val() as string;
  localStorage.setItem("fromvalue", from);
  // console.log(localStorage.getItem("fromvalue"));
});

//To
$("#checkoutSubmit").click(function () {
  var from = $("#bookingToInput").val() as string;
  localStorage.setItem("tovalue", from);
  // console.log(localStorage.getItem("tovalue"));
});

//Departure Date
$("#checkoutSubmit").click(function () {
  var departureDate = $("#bookingDepartureDateInput").val() as string;
  localStorage.setItem("datevalue", departureDate);
  // console.log(localStorage.getItem("datevalue"));
});

//Departure Time
$("#checkoutSubmit").click(function () {
  var departureTime = $("#bookingDepartureTimeInput").val() as string;
  localStorage.setItem("timevalue", departureTime);
  // console.log(localStorage.getItem("timevalue"));
});

//Number Of Tickets
$("#checkoutSubmit").click(function () {
  var noOfTickets = $("#bookingTicketsInput").val() as string;
  localStorage.setItem("textvalue", noOfTickets);
  // console.log(localStorage.getItem("textvalue"));
});

//Promotion Code

//Gender

//Date of Birth

//Contact Number
$("#checkoutSubmit").click(function () {
  var contactNo = $("#bookingContactNoInput").val() as string;
  localStorage.setItem("contactnovalue", contactNo);
  // console.log(localStorage.getItem("contactnovalue"));
});

//Credit Card Number
$("#finalCheckout").click(function () {
  var cardNo = $("#bookingCardNoInput").val() as string;
  localStorage.setItem("cardnumber", cardNo);
  console.log(localStorage.getItem("cardnumber"));
});

// Locations-From
jQuery(async function () {
  await LocationService.getOnlineLocations();
  let allLocations = LocationService.getAllLocationsAsArray();
  let text = "";
  allLocations.forEach((element) => {
    text += `<option value="${element.name}">${element.name}</option>`;
  });
  $("#bookingFromInput").append(text);
  $("#bookingToInput").append(text);
  localStorage.setItem("fromvalue", allLocations[0].name);
  localStorage.setItem("tovalue", allLocations[1].name);
});

//Trip-Fare
$(document).ready(function () {
  const precision = 100; //2 decimals
  const randomNum: any = Math.floor(Math.random() * (30 * precision - 1 * precision) + 1 * precision) / (1 * precision);
  $("input#bookingTripFareInput").attr("value", randomNum);
  $("input#bookingFinalTotalInput").attr("value", randomNum);
  localStorage.setItem("tempTripFare", randomNum);
});

//User-points calculation
var finalTripFare: any;
jQuery(() => {
  const loggedInUser = UserService.getLoggedInUser();
  if (!loggedInUser) {
    window.location.replace(`/login.html?redirect=${window.location.pathname}${window.location.search}`);
    return;
  }
  $("#promoCodeApply").click(function (e) {
    e.preventDefault();
    $(this).data("clicked", true);
    var promoCodeValue: number = parseFloat($("input#bookingPromotionCodeInput").val() as string);
    // console.log(promoCodeValue);
    var tripFareValue: number = parseFloat(localStorage.getItem("tempTripFare") as string);
    if (promoCodeValue <= 0) {
      promoCodeValue = 0.5;
    }
    if (promoCodeValue > tripFareValue) {
      promoCodeValue = tripFareValue;
      finalTripFare = 0.5;
      // console.log(finalTripFare);
      $("input#bookingFinalTotalInput").attr("value", finalTripFare.toFixed(2));
    } else {
      finalTripFare = tripFareValue - promoCodeValue;
      $("input#bookingFinalTotalInput").attr("value", finalTripFare.toFixed(2));
    }

    UserService.removePointsFromUser(loggedInUser.id, promoCodeValue);
    const refreshUser = UserService.getLoggedInUser()!;
    $("input#bookingPromotionCodeInput").val(refreshUser.userPoints.toFixed(2));
    localStorage.setItem("finalTripFare", finalTripFare.toFixed(2));
    // console.log(localStorage.getItem("finalTripFare"));
  });
});

$("#checkoutSubmit").click(function () {
  if ($("#promoCodeApply").data("clicked")) {
    localStorage.setItem("finalTripFare", finalTripFare);
  } else {
    var tripFare = $("input#bookingTripFareInput").val() as string;
    localStorage.setItem("finalTripFare", tripFare);
    // console.log(localStorage.getItem("finalTripFare"));
  }
});

// stripe redirect code
function onSubmitCode(e: JQuery.TriggeredEvent) {
  e.preventDefault();
  const loggedInUser = UserService.getLoggedInUser();
  if (!loggedInUser) {
    window.location.replace(`/login.html?redirect=${window.location.pathname}${window.location.search}`);
    return;
  }
  $(`form[name="payment-form"]`).attr("action", getServerUrls().postStripeCheckoutSession);
  $(`form[name="payment-form"] input[name="email"]`).attr("value", loggedInUser.email); // change these fields
  // console.log(localStorage.getItem("finalTripFare"));
  // return;
  $(`form[name="payment-form"] input[name="price"]`).attr("value", localStorage.getItem("finalTripFare")); // change these fields
  $(`form[name="payment-form"] input[name="host"]`).attr(
    "value",
    `${window.location.protocol}//${window.location.host}`
  );

  e.currentTarget.submit();
}

jQuery(() => {
  $('form[name="payment-form"]').on("submit", onSubmitCode);
});
