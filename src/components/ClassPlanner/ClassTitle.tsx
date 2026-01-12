import { useState, useCallback } from 'react';
import { Edit2, Check } from '../Common/Icons';
import { useStoreItem } from '../../hooks/useDataStore';
import { dataStore } from '../../store/DataStore';

export default function ClassTitle() {
    const title = useStoreItem('class-title', () => dataStore.getClassTitle());
    const [isEditing, setIsEditing] = useState(false);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        dataStore.setClassTitle(e.target.value);
    }, []);

    const handleStartEdit = useCallback(() => {
        setIsEditing(true);
    }, [setIsEditing]);
    const handleEndEdit = useCallback(() => {
        dataStore.setClassTitle(prev => prev.trim());
        setIsEditing(false);
    }, [setIsEditing]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleEndEdit();
        } else if (e.key === 'Escape') {
            handleEndEdit();
        }
    }, [handleEndEdit]);

    return (
        <div className="mb-6 pb-4 border-b border-pink-100 dark:border-pink-900/50">
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Nombre de la clase (opcional)"
                        className="w-full px-4 py-2 text-xl font-serif font-medium text-pink-950 dark:text-pink-100 bg-white dark:bg-gray-800 border-2 border-pink-300 dark:border-pink-900 rounded-lg focus:outline-none focus:border-pink-500 dark:focus:border-pink-700 transition-colors"
                        onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                        autoFocus
                    />
                    <button
                        onClick={handleEndEdit}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors flex-shrink-0"
                        title="Guardar título"
                    >
                        <Check size={24} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between group">
                    {title ? (
                        <h2
                            className="text-2xl text-center font-serif font-bold text-pink-700 dark:text-pink-400 cursor-pointer hover:text-pink-400 dark:hover:text-pink-300 transition-colors flex-grow"
                            onClick={handleStartEdit}
                            title="Click para editar"
                        >
                            {title}
                        </h2>
                    ) : (
                        <button
                            onClick={handleStartEdit}
                            className="w-full text-xl font-serif font-medium text-pink-400 dark:text-pink-600 hover:text-pink-600 dark:hover:text-pink-400 transition-colors flex items-center gap-2"
                        >
                            <Edit2 size={20} />
                            <span>Añadir título a la clase...</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}