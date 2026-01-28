export const ENVIRONMENTS = {
    DEV: {
        backendUrl: "https://api-dev.tap.st/",
        backendUrlV2: "https://api-v2-dev.tap.st/",
        pusherKey: "b3ed46dc4b4ff9192bef",
        versionPostfix: "d",
        tapPageUrl: "https://tappage-dev.tap.st/",
    },
    STAGE: {
        backendUrl: "https://api-staging.tap.st/",
        backendUrlV2: "https://api-v2-staging.tap.st/",
        pusherKey: "5db5ca19614e8fbc4515",
        versionPostfix: "s",
        tapPageUrl: "https://tappage-staging.tap.st/",
    },
    PROD: {
        backendUrl: "https://api.theaccessplatform.com/",
        backendUrlV2: "https://api-v2.theaccessplatform.com/",
        pusherKey: "b467b31f50874ddbe4a1",
        versionPostfix: "p",
        tapPageUrl: "https://tappage.theaccessplatform.com/",
    },
};

// Here back-end URL and pusher key should be updated with values dev/stage/prod
export const ENVIRONMENT = ENVIRONMENTS.STAGE;
