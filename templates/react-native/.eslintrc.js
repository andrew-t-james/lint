module.exports = {
  "parser": "babel-eslint",
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended"
  ],
  "plugins": [
    "react",
    "react-native",
    "prettier"
  ],
  "env": {
    "browser": true,
    "node": true,
    "jest": true,
    "react-native/react-native": true
  },
  "rules": {
    "semi": 0,
    "react/prop-types": 0
  },
  "parserOptions": {
    "ecmaFeatures": {
        "jsx": true
    }
  }
}