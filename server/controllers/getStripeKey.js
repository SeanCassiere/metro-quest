const getStripeKey = () => {
  const stripe_key = process.env.STRIPE_KEY ?? "process.env.STRIPE_KEY is unavailable";
  return { stripe_key };
};

module.exports = getStripeKey;
