import LocationService, { Location } from "./services/LocationService.js";
import { getServerUrls } from "./utils/environment.js";
import UserService from "./services/UserService.js";
import { dynamicNavbar } from "./services/changeNavbar.js";

jQuery(() => {
  const loggedInUser = UserService.getLoggedInUser();
  if (!loggedInUser) {
    window.location.replace(`/login.html?redirect=${window.location.pathname}${window.location.search}`);
    return;
  }
  // console.log(loggedInUser);
  if (loggedInUser) {
    $("#bookingFirstNameInput").val(loggedInUser.firstName);
    $("#bookingLastNameInput").val(loggedInUser.lastName);
    $("#bookingEmailInput").val(loggedInUser.email);
    if (loggedInUser.userPoints <= 0) {
      $("#bookingPromotionCodeInput").prop("readonly", true);
    }
    $("#bookingPromotionCodeInput").val(loggedInUser.userPoints);
  }
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
  // console.log(allLocations);
  $("#bookingFromInput").ready(function () {
    let text = "";
    allLocations.forEach((element) => {
      text += `<option value="${element.name}">${element.name}</option>`;
    });
    // console.log(text);
    $("#bookingFromInput").append(text);
  });
});

// Locations-To
jQuery(async function () {
  await LocationService.getOnlineLocations();
  let allLocations = LocationService.getAllLocationsAsArray();
  // console.log(allLocations);
  $("#bookingToInput").ready(function () {
    let text = "";
    allLocations.forEach((element) => {
      text += `<option value="${element.name}">${element.name}</option>`;
    });
    // console.log(text);
    $("#bookingToInput").append(text);
  });
});

//Trip-Fare
$(document).ready(function () {
  var precision = 100; //2 decimals
  var randomnum: any = Math.floor(Math.random() * (30 * precision - 1 * precision) + 1 * precision) / (1 * precision);
  var tripFare: any = document.getElementById("bookingTripFareInput")!.setAttribute("value", randomnum);
  localStorage.setItem("tempTripFare", randomnum);
  // console.log("works", randomnum);
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
    var promoCodeValue: number = parseFloat($("#bookingPromotionCodeInput").val() as string);
    // console.log(promoCodeValue);
    var tripFareValue: number = parseFloat(localStorage.getItem("tempTripFare") as string);
    if (promoCodeValue <= 0) {
      promoCodeValue = 0.5;
    }
    if (promoCodeValue > tripFareValue) {
      promoCodeValue = tripFareValue;
      finalTripFare = tripFareValue - promoCodeValue;
      // console.log(finalTripFare);
    } else {
      finalTripFare = tripFareValue - promoCodeValue;
    }

    // console.log(tripFareValue);
    // console.log(finalTripFare);
    UserService.removePointsFromUser(loggedInUser.id, promoCodeValue);
    localStorage.setItem("finalTripFare", finalTripFare);
    // console.log(localStorage.getItem("finalTripFare"));
  });
});

$("#checkoutSubmit").click(function () {
  if ($("#promoCodeApply").data("clicked")) {
    localStorage.setItem("finalTripFare", finalTripFare);
  } else {
    var tripFare = $("#bookingTripFareInput").val() as string;
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
