// Color utility functions for working with hex colors

// MIT License

// Copyright (c) 2023 David Young

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
// Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// All code here courtesy of Claude Sonnet  4.

/**
 * Determine if a hex color is considered "dark" using relative luminance
 * Based on WCAG (Web Content Accessibility Guidelines) formula
 *
 * @param {string} hexColor - Hex color string (with or without #)
 * @returns {boolean} - True if the color is dark, false if light
 */
export const isColorDark = (hexColor) => {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Convert to RGB values (0-1 range)
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Calculate relative luminance using WCAG formula
  // https://www.w3.org/TR/WCAG20-TECHS/G17.html
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // If luminance is less than 0.5, it's a dark color
  return luminance < 0.5;
};

/**
 * Get an appropriate contrasting text color for a given background color
 *
 * @param {string} backgroundColor - Hex color string for the background
 * @param {string} lightColor - Color to use for dark backgrounds (default: light cream)
 * @param {string} darkColor - Color to use for light backgrounds (default: dark burgundy)
 * @returns {string} - The contrasting color
 */
export const getContrastingTextColor = (backgroundColor, lightColor = '#e6d9cc', darkColor = '#8B4049') => {
  return isColorDark(backgroundColor) ? lightColor : darkColor;
};

/**
 * Convert hex color to RGB object
 *
 * @param {string} hexColor - Hex color string (with or without #)
 * @returns {object} - Object with r, g, b properties (0-255 range)
 */
export const hexToRgb = (hexColor) => {
  const hex = hexColor.replace('#', '');

  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
};

/**
 * Convert RGB values to hex color string
 *
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} - Hex color string with # prefix
 */
export const rgbToHex = (r, g, b) => {
  const toHex = (value) => {
    const hex = Math.round(Math.max(0, Math.min(255, value))).toString(16);
    
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
