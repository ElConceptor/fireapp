const { createRequestHandler } = require('../server/api');
const { openDatabase } = require('../server/db');

let handler;

module.exports = async (request, response) => {
  if (!handler) {
    handler = createRequestHandler(openDatabase(), { apiOnly: true });
  }

  await handler(request, response);
};
