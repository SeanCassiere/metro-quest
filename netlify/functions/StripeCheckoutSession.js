const generateStripeCheckoutSession = require("../../server/controllers/generateStripeCheckoutSession");

exports.handler = async (evt, ctx) => {
  const { host, price, email } = evt.queryStringParameters;
  const id = await generateStripeCheckoutSession({ host, price, email });
  return { statusCode: 303, url: id.url, redirect: id.url };
};
