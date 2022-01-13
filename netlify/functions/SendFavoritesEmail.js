const emailFavorites = require("../../server/controllers/emailFavorites");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const body = event.body;
  const response = await emailFavorites(JSON.parse(body));

  if (!response) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: false }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};
