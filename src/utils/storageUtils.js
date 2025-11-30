/**
 * Utility functions for localStorage operations with error handling
 */

/**
 * Safely get an item from localStorage
 * @param {string} key - The storage key
 * @returns {string|null} The stored value or null if not found/error
 */
export function getStorageItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
}

/**
 * Safely set an item in localStorage
 * @param {string} key - The storage key
 * @param {any} value - The value to store (will be JSON stringified)
 * @returns {boolean} True if successful, false otherwise
 */
export function setStorageItem(key, value) {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 * @param {string} key - The storage key
 * @returns {boolean} True if successful, false otherwise
 */
export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    // Silently ignore cache errors (common in private browsing mode)
    return false;
  }
}

/**
 * Get a parsed JSON value from localStorage
 * @param {string} key - The storage key
 * @returns {any|null} The parsed value or null if not found/error
 */
export function getStorageJSON(key) {
  const item = getStorageItem(key);
  if (!item) return null;
  
  try {
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error parsing JSON from localStorage (${key}):`, error);
    return null;
  }
}

/**
 * Cache management with timestamp expiration
 */
export function createCacheManager(cacheKey, timestampKey, cacheDuration = 60 * 60 * 1000) {
  return {
    /**
     * Get cached data if it exists and hasn't expired
     * @returns {any|null} Cached data or null
     */
    get() {
      const cached = getStorageItem(cacheKey);
      const timestamp = getStorageItem(timestampKey);
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < cacheDuration) {
          try {
            return JSON.parse(cached);
          } catch (error) {
            console.error(`Error parsing cached data (${cacheKey}):`, error);
            this.clear();
            return null;
          }
        }
        // Cache expired, remove it
        this.clear();
      }
      return null;
    },

    /**
     * Set cached data with current timestamp
     * @param {any} data - Data to cache
     */
    set(data) {
      if (setStorageItem(cacheKey, data)) {
        setStorageItem(timestampKey, Date.now().toString());
      }
    },

    /**
     * Clear cached data
     */
    clear() {
      removeStorageItem(cacheKey);
      removeStorageItem(timestampKey);
    }
  };
}

