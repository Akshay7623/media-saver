const withMT = require("@material-tailwind/react/utils/withMT");

const { nextui } = require("@nextui-org/theme");

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/components/(accordion|button|input|navbar|divider|ripple|spinner).js",
  ],
  theme: {
    extend: {},
  },
  plugins: [nextui()],
});
