module.exports = {
  apps : [{
    name        : "SILB",
    script      : "./js/index.js",
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
      "NODE_ENV": "production"
    }
  }]
}
