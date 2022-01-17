const express = require("express");
const serverless = require("serverless-http");
const app = express();

const generateStripeCheckoutSession = require("../../server/controllers/generateStripeCheckoutSession");

app.get("/api/StripeCheckoutSession", async (req, res) => {
  const { host, price, email } = req.query;
  const id = await generateStripeCheckoutSession({ host, price, email });
  res.redirect(303, id.url);
});

module.exports.handler = serverless(app);
