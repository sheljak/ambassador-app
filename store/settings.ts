export type EnvironmentType = 'DEV' | 'STAGE' | 'PROD';

export interface EnvironmentConfig {
    backendUrl: string;
    backendUrlV2: string;
    pusherKey: string;
    versionPostfix: string;
    tapPageUrl: string;
}

export const ENVIRONMENTS: Record<EnvironmentType, EnvironmentConfig> = {
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

let currentEnvironment: EnvironmentType = 'STAGE';

export const getEnvironment = (): EnvironmentType => currentEnvironment;

export const setEnvironment = (env: EnvironmentType): void => {
    currentEnvironment = env;
};

export const getConfig = (): EnvironmentConfig => ENVIRONMENTS[currentEnvironment];

export const getBackendUrl = (): string => getConfig().backendUrl;
export const getBackendUrlV2 = (): string => getConfig().backendUrlV2;
export const getPusherKey = (): string => getConfig().pusherKey;
export const getTapPageUrl = (): string => getConfig().tapPageUrl;
