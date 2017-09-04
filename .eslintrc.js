module.exports = {
    "extends": "airbnb-base",
      "env": {
        "browser": true,
        "es6": true
      },
    "globals": {
        "window": true,
        "document": true
    },
    "rules": {
      "skipBlankLines": 0,
      "comma-dangle": ["error", "never"],
      "arrow-body-style": [0, "as-needed"]
    }
};