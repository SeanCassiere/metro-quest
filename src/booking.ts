// var _awaiter = (this && this._awaiter) || function (thisArg, _arguments, P, generator) {
//     function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
//     return new (P || (P = Promise))(function (resolve, reject) {
//         function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
//         function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
//         function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
//         step((generator = generator.apply(thisArg, _arguments || [])).next());
//     });
// };

// import LocationService, { Location } from "./services/LocationService.js";
import UserService from "./services/UserService.js";
import { dynamicNavbar } from "./services/changeNavbar.js";

jQuery(() => {
  const loggedInUser = UserService.getLoggedInUser();
  if (!loggedInUser) {
    window.location.replace(`/login.html?redirect=${window.location.pathname}${window.location.search}`);
    return;
  }
  console.log(loggedInUser);
  if (loggedInUser) {
    $("#bookingFirstNameInput").val(loggedInUser.firstName);
    $("#bookingLastNameInput").val(loggedInUser.lastName);
    $("#bookingEmailInput").val(loggedInUser.email);
  }
});

//From

//To

//Departure Date
$("#checkoutSubmit").click(function () {
  var departureDate = $("#bookingDepartureDateInput").val() as string;
  localStorage.setItem("datevalue", departureDate);
  console.log(localStorage.getItem("datevalue"));
});

//Departure Time
$("#checkoutSubmit").click(function () {
  var departureTime = $("#bookingDepartureTimeInput").val() as string;
  localStorage.setItem("timevalue", departureTime);
  console.log(localStorage.getItem("timevalue"));
});

//Number Of Tickets
$("#checkoutSubmit").click(function () {
  var noOfTickets = $("#bookingTicketsInput").val() as string;
  localStorage.setItem("textvalue", noOfTickets);
  console.log(localStorage.getItem("textvalue"));
});

//Promotion Code

//Gender

//Date of Birth

//Contact Number
$("#checkoutSubmit").click(function () {
  var contactNo = $("#bookingContactNoInput").val() as string;
  localStorage.setItem("contactnovalue", contactNo);
  console.log(localStorage.getItem("contactnovalue"));
});

//Credit Card Number
$("#finalCheckout").click(function () {
  var cardNo = $("#bookingCardNoInput").val() as string;
  localStorage.setItem("cardnumber", cardNo);
  console.log(localStorage.getItem("cardnumber"));
});

//Locations
// jQuery(function(){
//     return __awaiter(this, void 0, void 0, function* () {
//         yield LocationService.getOnlineLocations();
//         let locations = LocationService.getAllLocationsAsArray();
//         $("#bookingFromInput").ready(function(){
//             let text = ""
//             allLocations.forEach(element => {
//                 text += `<option value="${element.name}">${element.name}</option>`
//             });
//             console.log(text)
//             $(this).html(text)
//         })
//     });
// })
