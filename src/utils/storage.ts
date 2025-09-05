// src/utils/storage.ts

export const storage = {
    // --- localStorage ---
    set: <T>(key: string, value: T): void => {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
        } catch (error) {
            console.error("Error saving to localStorage", error);
        }
    },
    get: <T>(key: string, defaultValue: T | null = null): T | null => {
        try {
            const serializedValue = localStorage.getItem(key);
            if (serializedValue === null) {
                return defaultValue;
            }
            return JSON.parse(serializedValue) as T;
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return defaultValue;
        }
    },
    remove: (key: string): void => {
        localStorage.removeItem(key);
    },

};

