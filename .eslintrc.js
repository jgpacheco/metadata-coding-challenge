module.exports = {
  "extends": "airbnb-base",
  "env": {
    "jasmine": true
  },
  "rules": {
    "prefer-destructuring": "off",
    "max-len": ["error", { "code": 120 }],
    "no-underscore-dangle": ["error", { "allow": ["_id"] }],
    "comma-dangle": ["error", {
      "arrays": "never",
      "objects": "always-multiline",
      "imports": "never",
      "exports": "never",
      "functions": "never"
    }]
  }
};
