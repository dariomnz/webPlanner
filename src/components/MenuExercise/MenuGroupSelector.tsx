import { useState, useCallback } from 'react';
import { Plus, Tag, Trash2, ChevronDown } from '../Common/Icons';
import { dataStore } from '../../store/DataStore';
import ConfirmationModal from '../Common/ConfirmationModal';

interface MenuGroupSelectorProps {
    groups: string[];
    selectedGroup: string;
    onSelectGroup: (group: string) => void;
    isEditMode: boolean;
}

export default function MenuGroupSelector({
    groups,
    selectedGroup,
    onSelectGroup,
    isEditMode
}: MenuGroupSelectorProps) {
    const [newGroup, setNewGroup] = useState('');
    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

    const handleAddGroup = useCallback((groupName: string) => {
        dataStore.addGroup(groupName);
        onSelectGroup(groupName);
    }, [onSelectGroup]);

    const handleDeleteGroup = useCallback(() => {
        setGroupToDelete(selectedGroup);
    }, [selectedGroup, setGroupToDelete]);

    const confirmDeleteGroup = useCallback(() => {
        if (groupToDelete) {
            dataStore.removeGroup(groupToDelete);
            setGroupToDelete(null);
        }
    }, [groupToDelete, setGroupToDelete]);
    const handleCloseDeleteGroupModal = useCallback(() => setGroupToDelete(null), [setGroupToDelete]);

    const handleAddGroupSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (newGroup.trim()) {
            handleAddGroup(newGroup.trim());
            setNewGroup('');
            setIsAddingGroup(false);
        }
    }, [newGroup, handleAddGroup]);

    const handleToggleAdding = useCallback(() => {
        setIsAddingGroup(prev => !prev);
    }, []);

    return (
        <>
            <div>
                <div className="flex gap-2 items-center">
                    <Tag size={16} className="text-primary-600 dark:text-primary-400" />
                    <div className="relative flex-1">
                        {groups.length > 0 ? (
                            <>
                                <select
                                    value={selectedGroup}
                                    onChange={(e) => onSelectGroup(e.target.value)}
                                    className="w-full appearance-none px-3 py-2 pr-8 text-sm rounded-lg border border-primary-200 dark:border-primary-900/50 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800 text-primary-900 dark:text-primary-100 font-medium shadow-sm hover:border-primary-300 dark:hover:border-primary-800 transition-colors cursor-pointer"
                                >
                                    {groups.map((group: string) => (
                                        <option key={group} value={group} className="dark:bg-gray-800">
                                            {group}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-400 dark:text-primary-600 pointer-events-none" size={16} />
                            </>
                        ) : (
                            <div className="w-full px-3 py-2 text-sm rounded-lg border border-primary-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600 italic">
                                No hay grupos
                            </div>
                        )}
                    </div>

                    {isEditMode && (
                        <div className="flex gap-1">
                            <button
                                onClick={handleToggleAdding}
                                className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-all border border-primary-200 dark:border-primary-900/50"
                                title="Añadir nuevo grupo"
                            >
                                <Plus size={16} />
                            </button>
                            {groups.length > 0 && (
                                <button
                                    onClick={handleDeleteGroup}
                                    className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 rounded-lg transition-all border border-red-200 dark:border-red-900/50"
                                    title={`Eliminar grupo "${selectedGroup}"`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {isAddingGroup && (
                    <form onSubmit={handleAddGroupSubmit} className="mt-2 p-2 bg-primary-50 dark:bg-primary-900/10 rounded-lg border border-primary-100 dark:border-primary-900/30">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newGroup}
                                onChange={(e) => setNewGroup(e.target.value)}
                                placeholder="Ej: Ballet, Contemporáneo..."
                                className="flex-1 min-w-0 px-2 py-1 text-xs rounded border border-primary-200 dark:border-primary-900/50 focus:outline-none focus:ring-1 focus:ring-primary-400 dark:focus:ring-primary-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="p-1 bg-primary-500 text-white rounded hover:bg-primary-600"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <ConfirmationModal
                isOpen={!!groupToDelete}
                onClose={handleCloseDeleteGroupModal}
                onConfirm={confirmDeleteGroup}
                title="¿Eliminar grupo?"
                message={`¿Estás seguro de que quieres eliminar el grupo "${groupToDelete}"? SE BORRARÁN TODOS LOS EJERCICIOS Y SECCIONES de este grupo. Esta acción no se puede deshacer.`}
            />
        </>
    );
}
