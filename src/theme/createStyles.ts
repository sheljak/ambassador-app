import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme, type Theme } from './hooks/useTheme';

type NamedStyles<T> = StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>;

export const createStyles = <T extends NamedStyles<T>>(styles: (theme: Theme) => T) => {
  return function useStyles() {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(styles(theme)), [theme]);
  };
};
