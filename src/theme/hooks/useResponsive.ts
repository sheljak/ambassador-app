/**
 * Responsive utilities hook for cross-platform responsive design
 */

import { useState, useEffect, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { breakpoints, getBreakpoint, type BreakpointKey } from '../breakpoints';

type ResponsiveValue<T> = Partial<Record<BreakpointKey, T>>;

interface ResponsiveState {
  width: number;
  height: number;
  screenSize: BreakpointKey;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

interface UseResponsiveReturn extends ResponsiveState {
  /**
   * Select a value based on current screen size
   * Returns the value for the largest breakpoint that's <= current screen size
   */
  responsive: <T>(values: ResponsiveValue<T>) => T | undefined;
}

export function useResponsive(): UseResponsiveReturn {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription.remove();
  }, []);

  const screenSize = getBreakpoint(dimensions.width);

  const responsive = useCallback(
    <T>(values: ResponsiveValue<T>): T | undefined => {
      // Find the largest breakpoint that's <= current width and has a value
      const breakpointOrder: BreakpointKey[] = ['xl', 'lg', 'md', 'sm'];

      for (const bp of breakpointOrder) {
        if (breakpoints[bp] <= dimensions.width && values[bp] !== undefined) {
          return values[bp];
        }
      }

      // Fallback to smallest defined value
      for (const bp of [...breakpointOrder].reverse()) {
        if (values[bp] !== undefined) {
          return values[bp];
        }
      }

      return undefined;
    },
    [dimensions.width]
  );

  return {
    width: dimensions.width,
    height: dimensions.height,
    screenSize,
    isPhone: screenSize === 'sm',
    isTablet: screenSize === 'md',
    isDesktop: screenSize === 'lg' || screenSize === 'xl',
    responsive,
  };
}

/**
 * Higher-order function for creating responsive style values outside of components
 * Useful for static style definitions
 */
export function createResponsiveValue<T>(values: ResponsiveValue<T>) {
  return (width: number): T | undefined => {
    const breakpointOrder: BreakpointKey[] = ['xl', 'lg', 'md', 'sm'];

    for (const bp of breakpointOrder) {
      if (breakpoints[bp] <= width && values[bp] !== undefined) {
        return values[bp];
      }
    }

    for (const bp of [...breakpointOrder].reverse()) {
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }

    return undefined;
  };
}
