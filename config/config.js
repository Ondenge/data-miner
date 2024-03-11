require('dotenv').config();

module.exports = {
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  api: {
    baseUrl: process.env.API_BASE_URL,
    username: process.env.API_USERNAME,
    password: process.env.API_PASSWORD,
  },
};
