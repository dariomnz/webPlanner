import { useState, useCallback } from 'react';
import { Plus, Tag, Trash2, ChevronDown } from 'lucide-react';

interface GroupSelectorProps {
    groups: string[];
    selectedGroup: string;
    onSelectGroup: (group: string) => void;
    onAddGroup: (group: string) => void;
    onDeleteGroup: (group: string) => void;
    isEditMode: boolean;
}

export function GroupSelector({
    groups,
    selectedGroup,
    onSelectGroup,
    onAddGroup,
    onDeleteGroup,
    isEditMode
}: GroupSelectorProps) {
    const [newGroup, setNewGroup] = useState('');
    const [isAddingGroup, setIsAddingGroup] = useState(false);

    const handleAddGroupSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (newGroup.trim()) {
            onAddGroup(newGroup.trim());
            setNewGroup('');
            setIsAddingGroup(false);
        }
    }, [newGroup, onAddGroup]);

    const handleToggleAdding = useCallback(() => {
        setIsAddingGroup(prev => !prev);
    }, []);

    const handleDeleteClick = useCallback(() => {
        onDeleteGroup(selectedGroup);
    }, [onDeleteGroup, selectedGroup]);

    return (
        <div>
            <div className="flex gap-2 items-center">
                <Tag size={16} className="text-pink-600" />
                <div className="relative flex-1">
                    {groups.length > 0 ? (
                        <>
                            <select
                                value={selectedGroup}
                                onChange={(e) => onSelectGroup(e.target.value)}
                                className="w-full appearance-none px-3 py-2 pr-8 text-sm rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white text-pink-900 font-medium shadow-sm hover:border-pink-300 transition-colors cursor-pointer"
                            >
                                {groups.map((group: string) => (
                                    <option key={group} value={group}>
                                        {group}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-pink-400 pointer-events-none" size={16} />
                        </>
                    ) : (
                        <div className="w-full px-3 py-2 text-sm rounded-lg border border-pink-200 bg-gray-50 text-gray-400 italic">
                            No hay grupos
                        </div>
                    )}
                </div>

                {isEditMode && (
                    <div className="flex gap-1">
                        <button
                            onClick={handleToggleAdding}
                            className="p-2 text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-lg transition-all border border-pink-200"
                            title="Añadir nuevo grupo"
                        >
                            <Plus size={16} />
                        </button>
                        {groups.length > 0 && (
                            <button
                                onClick={handleDeleteClick}
                                className="p-2 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all border border-red-200"
                                title={`Eliminar grupo "${selectedGroup}"`}
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {isAddingGroup && (
                <form onSubmit={handleAddGroupSubmit} className="mt-2 p-2 bg-pink-50 rounded-lg border border-pink-100">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newGroup}
                            onChange={(e) => setNewGroup(e.target.value)}
                            placeholder="Ej: Ballet, Contemporáneo..."
                            className="flex-1 min-w-0 px-2 py-1 text-xs rounded border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-400 bg-white"
                            onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="p-1 bg-pink-500 text-white rounded hover:bg-pink-600"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
