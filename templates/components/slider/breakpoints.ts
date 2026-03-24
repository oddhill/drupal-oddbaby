/**
 * Breakpoints and responsive utilities
 * Must match the breakpoints defined in responsive.scss
 */

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 600,
  'tablet-landscape': 900,
  desktop: 1200,
  'desktop-large': 1800,
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;

/**
 * Get the current active breakpoint based on window width
 * @returns The name of the current breakpoint
 */
export const getCurrentBreakpoint = (): BreakpointName => {
  const width = window.innerWidth;
  const breakpointEntries = Object.entries(BREAKPOINTS).sort(
    ([, valueA], [, valueB]) => valueB - valueA
  );

  for (const [name, value] of breakpointEntries) {
    if (width >= value) {
      return name as BreakpointName;
    }
  }

  return 'mobile';
};

/**
 * Get a responsive value from a breakpoint map
 * Falls back to the smallest breakpoint that is <= current width
 * @param breakpointMap Object mapping breakpoint names to values
 * @returns The value for the current breakpoint or nearest lower breakpoint
 */
export const getResponsiveValue = <T>(
  breakpointMap: Partial<Record<BreakpointName, T>>
): T | undefined => {
  const width = window.innerWidth;
  const breakpointEntries = Object.entries(BREAKPOINTS).sort(
    ([, valueA], [, valueB]) => valueB - valueA
  );

  for (const [name] of breakpointEntries) {
    if (width >= (BREAKPOINTS[name as BreakpointName] || 0)) {
      const value = breakpointMap[name as BreakpointName];
      if (value !== undefined) {
        return value;
      }
    }
  }

  // Return the first available breakpoint value (usually 'mobile')
  for (const [name] of Object.entries(BREAKPOINTS)) {
    const value = breakpointMap[name as BreakpointName];
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
};

/**
 * Set up a listener for breakpoint changes
 * @param callback Function to call when breakpoint changes
 * @returns Cleanup function to remove the listener
 */
export const onBreakpointChange = (callback: (breakpoint: BreakpointName) => void): (() => void) => {
  let currentBreakpoint = getCurrentBreakpoint();

  const handleResize = () => {
    const newBreakpoint = getCurrentBreakpoint();
    if (newBreakpoint !== currentBreakpoint) {
      currentBreakpoint = newBreakpoint;
      callback(newBreakpoint);
    }
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
};
