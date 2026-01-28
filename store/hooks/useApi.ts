import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../index';
import { switchEnvironment, selectCurrentEnvironment, selectEnvironmentConfig } from '../slices/appSlice';
import { EnvironmentType, ENVIRONMENTS } from '../settings';
import apiClient from '../api/client';

export const useEnvironment = () => {
    const dispatch = useAppDispatch();
    const currentEnvironment = useAppSelector(selectCurrentEnvironment);
    const config = useAppSelector(selectEnvironmentConfig);

    const changeEnvironment = useCallback((env: EnvironmentType) => {
        dispatch(switchEnvironment(env));
        apiClient.switchEnvironment(env);
    }, [dispatch]);

    return {
        currentEnvironment,
        config,
        environments: Object.keys(ENVIRONMENTS) as EnvironmentType[],
        changeEnvironment,
    };
};

export const useApiClient = () => {
    return apiClient;
};
