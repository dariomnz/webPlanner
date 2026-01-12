import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Palette } from '../Common/Icons';
import { dataStore } from '../../store/DataStore';
import { useStoreItem } from '../../hooks/useDataStore';

const themes = [
    { id: 'pink', name: 'Rosa', color: 'bg-pink-500' },
    { id: 'blue', name: 'Azul', color: 'bg-blue-500' },
    { id: 'green', name: 'Verde', color: 'bg-green-500' },
    { id: 'red', name: 'Rojo', color: 'bg-red-500' },
    { id: 'violet', name: 'Violeta', color: 'bg-violet-500' },
    { id: 'beige', name: 'Beige', color: 'bg-[rgb(224,205,149)]' },
];

const ThemeToggle = () => {
    const isDarkMode = useStoreItem('dark-mode', () => dataStore.getDarkMode());
    const currentTheme = useStoreItem('app-theme', () => dataStore.getAppTheme());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDarkMode = () => {
        dataStore.setDarkMode(!isDarkMode);
    };

    const selectTheme = (themeId: string) => {
        dataStore.setAppTheme(themeId);
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-primary-100 dark:border-gray-700 p-1 rounded-lg shadow-sm relative" ref={dropdownRef}>
            {/* Color Palette Dropdown Toggle */}
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-primary-500"
                    title="Cambiar color de tema"
                >
                    <Palette size={16} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2 flex flex-col gap-1">
                            {themes.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => selectTheme(theme.id)}
                                    className={`
                                        flex items-center gap-2 w-full px-2 py-1 rounded-lg text-xs font-medium transition-colors
                                        ${currentTheme === theme.id
                                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                                    `}
                                >
                                    <span className={`w-3 h-3 rounded-full ${theme.color} shadow-sm`} />
                                    {theme.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="w-px h-4 bg-gray-100 dark:bg-gray-700 mx-0.5" />

            {/* Dark Mode Toggle */}
            <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
                {isDarkMode ? (
                    <Sun size={16} className="text-amber-400" />
                ) : (
                    <Moon size={16} className="text-indigo-600" />
                )}
            </button>
        </div>
    );
};

export default ThemeToggle;
