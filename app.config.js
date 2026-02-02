export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    APP_ENV: process.env.APP_ENV || "STAGE",
  },
});
