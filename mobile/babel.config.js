module.exports = function (api) {
  api.cache(true);
  return {
    Presets: ['babel-preset-expo'],
    Plugins: ["nativewind/babel"],
  };
};
