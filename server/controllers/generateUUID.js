const uuid = require("uuid");

const { v4 } = uuid;

const generateUUID = () => {
  return v4();
};

module.exports = generateUUID;
