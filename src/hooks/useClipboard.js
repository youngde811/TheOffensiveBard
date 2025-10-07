// useClipboard.js - Custom hook for clipboard operations

import { useCallback } from 'react';
import * as Utilities from '../utils/utilities';

export const useClipboard = () => {
  const writeToClipboard = useCallback((text) => {
    try {
      Utilities.writeClipboard(text);
      return true;
    } catch (error) {
      console.error('Error writing to clipboard:', error);
      return false;
    }
  }, []);

  return { writeToClipboard };
};
