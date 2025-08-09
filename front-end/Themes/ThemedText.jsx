// import React from 'react';
// import { Text, useColorScheme } from 'react-native';

// const ThemedText = ({
//   style,
//   children,
//   lightColor,
//   darkColor,
//   variant = 'default',
//   ...props
// }) => {
//   const colorScheme = useColorScheme();

//   // Define color variants for different text types
//   const colorVariants = {
//     default: {
//       light: '#282828',
//       dark: '#ebebebff',
//     },
//     primary: {
//       light: '#202124',
//       dark: '#ebebebff',
//     },
//     secondary: {
//       light: '#233535ff',
//       dark: '#ebebebff',
//     },
//     muted: {
//       light: '#6B7280',
//       dark: '#888888',
//     },

//     bgWhite: {
//       light: '#efeeeeff',
//       dark: '#e5e4e4ff',
//     },
//     error: {
//       light: '#FF3B30',
//       dark: '#FF453A',
//     },
//     success: {
//       light: '#34C759',
//       dark: '#30D158',
//     },
//   };

//   // Get the appropriate color
//   const variantColors = colorVariants[variant] || colorVariants.default;
//   const textColor =
//     colorScheme === 'dark'
//       ? darkColor || variantColors.dark
//       : lightColor || variantColors.light;

//   return (
//     <Text style={[{ color: textColor }, style]} {...props}>
//       {children}
//     </Text>
//   );
// };

// export default ThemedText;

import React, { useMemo } from 'react';
import { Text, useColorScheme } from 'react-native';

// Move colorVariants outside component to prevent recreation on every render
const COLOR_VARIANTS = {
  default: {
    light: '#282828',
    dark: '#ebebebff',
  },
  primary: {
    light: '#202124',
    dark: '#ebebebff',
  },
  secondary: {
    light: '#233535ff',
    dark: '#ebebebff',
  },
  muted: {
    light: '#6B7280',
    dark: '#888888',
  },
  bgWhite: {
    light: '#efeeeeff',
    dark: '#e5e4e4ff',
  },
  error: {
    light: '#FF3B30',
    dark: '#FF453A',
  },
  success: {
    light: '#34C759',
    dark: '#30D158',
  },
};

const ThemedText = React.memo(
  ({
    style,
    children,
    lightColor,
    darkColor,
    variant = 'default',
    ...props
  }) => {
    const colorScheme = useColorScheme();

    // Memoize the text color calculation
    const textColor = useMemo(() => {
      const variantColors = COLOR_VARIANTS[variant] || COLOR_VARIANTS.default;
      return colorScheme === 'dark'
        ? darkColor || variantColors.dark
        : lightColor || variantColors.light;
    }, [colorScheme, variant, lightColor, darkColor]);

    // Memoize the combined style
    const combinedStyle = useMemo(
      () => [{ color: textColor }, style],
      [textColor, style]
    );

    return (
      <Text style={combinedStyle} {...props}>
        {children}
      </Text>
    );
  }
);

// Add display name for debugging
ThemedText.displayName = 'ThemedText';

export default ThemedText;
