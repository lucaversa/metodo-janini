// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

function getValue<T>(key: string, initialValue: T | (() => T)) {
    if (typeof window === 'undefined') {
        return initialValue instanceof Function ? initialValue() : initialValue;
    }
    try {
        const item = window.localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : (initialValue instanceof Function ? initialValue() : initialValue);
    } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
        return initialValue instanceof Function ? initialValue() : initialValue;
    }
}

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
    const [storedValue, setStoredValue] = useState<T>(() => getValue(key, initialValue));

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.warn(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue] as const;
}