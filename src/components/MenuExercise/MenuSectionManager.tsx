import { useState, useCallback } from 'react';
import { Plus, FolderPlus } from '../Common/Icons';
import { dataStore } from '../../store/DataStore';

interface MenuSectionManagerProps {
    selectedGroup: string;
    isEditMode: boolean;
}

export default function MenuSectionManager({
    selectedGroup,
    isEditMode
}: MenuSectionManagerProps) {
    const [newSection, setNewSection] = useState('');
    const [isAddingSection, setIsAddingSection] = useState(false);

    const handleAddSectionSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (newSection.trim()) {
            dataStore.addSection(newSection.trim(), selectedGroup);
            setNewSection('');
            setIsAddingSection(false);
        }
    }, [newSection, selectedGroup]);

    const handleToggleAdding = useCallback(() => {
        setIsAddingSection(prev => !prev);
    }, []);

    if (!isEditMode) return null;

    return (
        <div>
            <div className="mb-3"></div>
            <button
                onClick={handleToggleAdding}
                className="w-full flex items-center justify-center gap-2 text-xs font-medium text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-200 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-pink-200 dark:border-pink-900/50 shadow-sm hover:shadow transition-all"
            >
                <FolderPlus className="w-3 h-3" />
                Nueva Sección
            </button>

            {isAddingSection && (
                <form onSubmit={handleAddSectionSubmit} className="mt-3 p-3 bg-pink-50 dark:bg-pink-900/10 rounded-lg border border-pink-100 dark:border-pink-900/30">
                    <label className="block text-xs font-medium text-pink-800 dark:text-pink-300 mb-1">Nombre de la sección</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newSection}
                            onChange={(e) => setNewSection(e.target.value)}
                            placeholder="Ej: Brazos, Core..."
                            className="flex-1 min-w-0 px-2 py-1 text-sm rounded border border-pink-200 dark:border-pink-900/50 focus:outline-none focus:ring-1 focus:ring-pink-400 dark:focus:ring-pink-600 bg-white dark:bg-gray-800 dark:text-gray-100"
                            onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="p-1 bg-pink-500 text-white rounded hover:bg-pink-600"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
