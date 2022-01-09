const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// controllers or methods imported
const generateUUID = require("./controllers/generateUUID");
const getStripeKey = require("./controllers/getStripeKey");

dotenv.config();
const PORT = process.env.PORT ?? 4500;

const app = express();

app.use(cors());

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

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
