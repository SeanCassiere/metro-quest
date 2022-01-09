const generateUUID = require("../../server/controllers/generateUUID");

exports.handler = async (event, context) => {
  const response = generateUUID();
  const data = { token: response };
  return { statusCode: 200, body: JSON.stringify(data) };
};
