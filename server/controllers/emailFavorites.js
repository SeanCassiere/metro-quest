const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const SENDGRID_SMTP_HOST = process.env.SENDGRID_SMTP_HOST ?? "smtp.sendgrid.net";
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ?? "";
const SENDGRID_API_USER = process.env.SENDGRID_API_USER ?? "";
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL ?? "demo@example.com";

function emailHtml(locations, host) {
  let emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
  <style>
  table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 100%;
  }
  
  td, th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
  }
  
  tr:nth-child(even) {
    background-color: #dddddd;
  }
  </style>
  </head>
  <body>
  
  <h2>Favorite Locations</h2>
  
  <table>
  <tr>
  <th>Name</th>
  <th>Link</th>
  </tr>
  `;

  locations.forEach((location) => {
    emailHtml += `
    <tr>
    <td>${location.name}</td>
    <td><a target="_blank" alt="${location.name}" href="${host}/location.html?id=${location.id}">View</a></td>
    </tr>
    `;
  });

  emailHtml += `
  </table>
  </body>
  </html>
  `;
  return emailHtml;
}

/**
 * locations: [
 * {
 *  name: '',
 *  id: '',
 * }
 * ]
 *  */

async function sendFavoritesEmail(body) {
  const { recipientEmail, name, locations, host } = body;

  const locationsHtml = emailHtml(locations, host);

  try {
    const transporter = nodemailer.createTransport({
      host: SENDGRID_SMTP_HOST,
      port: 25,
      secure: false,
      auth: {
        user: SENDGRID_API_USER,
        pass: SENDGRID_API_KEY,
      },
    });

    transporter.sendMail({
      from: SENDGRID_FROM_EMAIL,
      to: recipientEmail,
      subject: `${name}'s favorite locations - Metro Quest`,
      html: locationsHtml,
    }).then((res) => {
      console.log(`Email successfully sent to ${recipientEmail}`)
    });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = sendFavoritesEmail;
