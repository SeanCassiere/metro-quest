const dotenv = require("dotenv");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_SECRET ?? "sk_test_4eC39HqLyjWDarjtT1zdp7dc");
/**
 * price is in cents
 * host: protocol + url + port
 */
const create = async ({ price, host, email }) => {
  return await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: "Train Ticket",
          },
          unit_amount: price * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${host}/bookingSummary.html?mode=success`,
    cancel_url: `${host}/bookingSummary.html?mode=failed`,
    customer_email: email,
  });
};

module.exports = create;
