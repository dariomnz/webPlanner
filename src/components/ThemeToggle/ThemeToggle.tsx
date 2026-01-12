import { Sun, Moon } from '../Common/Icons';
import { dataStore } from '../../store/DataStore';
import { useStoreItem } from '../../hooks/useDataStore';

const ThemeToggle = () => {
    const isDarkMode = useStoreItem('dark-mode', () => dataStore.getDarkMode());

    const toggleTheme = () => {
        dataStore.setDarkMode(!isDarkMode);
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
            ) : (
                <Moon className="w-5 h-5 text-indigo-600 group-hover:-rotate-12 transition-transform" />
            )}
        </button>
    );
};

export default ThemeToggle;
