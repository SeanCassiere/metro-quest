const getStripeKey = require("../../server/controllers/getStripeKey");

exports.handler = async (event, context) => {
  const response = getStripeKey();
  const data = { ...response };
  return { statusCode: 200, body: JSON.stringify(data) };
};
