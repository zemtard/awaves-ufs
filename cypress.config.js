const { defineConfig } = require("cypress");
require("dotenv").config();

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      port: process.env.PORT,
      URI: process.env.DATABASE_URI,
    },
  },
});
