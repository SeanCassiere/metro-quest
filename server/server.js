const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// controllers or methods imported
const generateUUID = require("./controllers/generateUUID");
const getStripeKey = require("./controllers/getStripeKey");
const emailFavorites = require("./controllers/emailFavorites");
const generateStripeCheckoutSession = require("./controllers/generateStripeCheckoutSession");

dotenv.config();
const PORT = process.env.PORT ?? 4500;

const app = express();

app.use(cors());
app.use(express.json());

// generate a UUID
app.get("/api/UUID", (_, res) => {
  const response = generateUUID();
  res.json({ token: response });
});

// get the stripe key
app.get("/api/StripeKey", (_, res) => {
  const response = getStripeKey();
  res.json(response);
});

app.post("/api/SendFavoritesEmail", async (req, res) => {
  const response = await emailFavorites(req.body);

  if (!response) {
    return res.json({ success: false });
  }

  return res.json({ success: true });
});

app.get("/api/StripeCheckoutSession", async (req, res) => {
  const { host, price, email } = req.query;
  // console.log(req.query);
  const id = await generateStripeCheckoutSession({ host, price, email });
  res.redirect(303, id.url);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
