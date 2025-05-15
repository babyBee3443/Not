
import { useState, useEffect, Dispatch, SetStateAction, useCallback } from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // Initialize state with initialValue. This ensures that the first render on the client
  // matches the server-rendered output, preventing a hydration mismatch.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // This effect runs only on the client, after the initial render.
  // It reads the value from localStorage and updates the state if a value is found.
  useEffect(() => {
    // Check for window to ensure this only runs on the client.
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) { // Only update if item actually exists
          setStoredValue(JSON.parse(item) as T);
        }
        // If item is null, storedValue remains `initialValue` due to useState initialization.
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        // In case of error, storedValue remains `initialValue`.
      }
    }
  }, [key]); // Dependency array includes `key` so the effect re-runs if the key changes.

  const setValue: SetValue<T> = useCallback(
    value => {
      // Determine the new value first, allowing for function form of setState.
      const newValue = value instanceof Function ? value(storedValue) : value;
      
      // Update React state. This is the primary source of truth for the UI.
      setStoredValue(newValue);

      // Then, attempt to persist to localStorage if on the client.
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
          // localStorage persistence failed, but React state is already updated.
        }
      }
    },
    [key, storedValue] // `storedValue` is needed for the updater function `value(storedValue)`.
                        // `key` is needed for localStorage.setItem.
  );

  return [storedValue, setValue];
}

export default useLocalStorage;
