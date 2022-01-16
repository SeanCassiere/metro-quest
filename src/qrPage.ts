// import { Camera, Scanner } from "instascan";

// let scanner = new Scanner({ video: document.getElementById('preview') });
//       scanner.addListener('scan', function (content: string | URL) {
//         window.location.replace(content);
//       });
//       Camera.getCameras().then(function (cameras: string | any[]) {
//         if (cameras.length > 0) {
//           scanner.start(cameras[0]);
//         } else {
//           console.error('No cameras found.');
//         }
//       }).catch(function (e: any) {
//         console.error(e);
//       });

// $("#qr-btn").on('click', function () {
//     $("#preview").toggleClass("hidden");

// })
var width = $(window).width();
var height = $(window).height();
function scale(width: number, height: number, padding: number, border: number) {
  var scrWidth = width - 30,
    scrHeight = height - 30,
    ifrPadding = 2 * padding,
    ifrBorder = 2 * border,
    ifrWidth = width + ifrPadding + ifrBorder,
    ifrHeight = height + ifrPadding + ifrBorder,
    h,
    w;

  if (ifrWidth < scrWidth && ifrHeight < scrHeight) {
    w = ifrWidth;
    h = ifrHeight;
  } else if (ifrWidth / scrWidth > ifrHeight / scrHeight) {
    w = scrWidth;
    h = (scrWidth / ifrWidth) * ifrHeight;
  } else {
    h = scrHeight;
    w = (scrHeight / ifrHeight) * ifrWidth;
  }

  return {
    width: w - (ifrPadding + ifrBorder),
    height: h - (ifrPadding + ifrBorder),
  };
}

$(document).on("pageinit", function () {
  $("#popupVideo iframe").attr("width", 0).attr("height", 0);

  $("popupVideo").on({
    popupbeforeposition: function () {
      var size = scale(500, 373.5, 15, 1),
        w = size.width,
        h = size.height;

      $("$popupVideo iframe").attr("width", w).attr("height", h);
    },
  });
  $("popupVideo").on({
    popupbeforeposition: function () {
      $("$popupVideo iframe").attr("width", 0).attr("height", 0);
    },
  });
});
