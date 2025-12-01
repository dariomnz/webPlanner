import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    // Get from local storage then parse stored json or return initialValue
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    // Debounce writing to localStorage to avoid performance issues during frequent updates
    useEffect(() => {
        const handler = setTimeout(() => {
            try {
                window.localStorage.setItem(key, JSON.stringify(storedValue));
            } catch (error) {
                console.error(error);
            }
        }, 100); // Wait 100ms after the last change to write

        return () => {
            clearTimeout(handler);
        };
    }, [key, storedValue]);

    // Return a wrapped version of useState's setter function
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            setStoredValue((prevValue) => {
                const valueToStore = value instanceof Function ? value(prevValue) : value;
                return valueToStore;
            });
        } catch (error) {
            console.error(error);
        }
    }, []);

    return [storedValue, setValue];
}

export default useLocalStorage;
