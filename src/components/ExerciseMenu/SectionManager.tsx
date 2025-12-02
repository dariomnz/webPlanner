import { useState } from 'react';
import { Plus, FolderPlus } from 'lucide-react';

interface SectionManagerProps {
    selectedGroup: string;
    onAddSection: (sectionName: string, group: string) => void;
    isEditMode: boolean;
}

export function SectionManager({
    selectedGroup,
    onAddSection,
    isEditMode
}: SectionManagerProps) {
    const [newSection, setNewSection] = useState('');
    const [isAddingSection, setIsAddingSection] = useState(false);

    const handleAddSectionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSection.trim()) {
            onAddSection(newSection.trim(), selectedGroup);
            setNewSection('');
            setIsAddingSection(false);
        }
    };

    if (!isEditMode) return null;

    return (
        <div>
            <div className="mb-3"></div>
            <button
                onClick={() => setIsAddingSection(!isAddingSection)}
                className="w-full flex items-center justify-center gap-2 text-xs font-medium text-pink-600 hover:text-pink-800 bg-white px-3 py-2 rounded-lg border border-pink-200 shadow-sm hover:shadow transition-all"
            >
                <FolderPlus className="w-3 h-3" />
                Nueva Sección
            </button>

            {isAddingSection && (
                <form onSubmit={handleAddSectionSubmit} className="mt-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
                    <label className="block text-xs font-medium text-pink-800 mb-1">Nombre de la sección</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newSection}
                            onChange={(e) => setNewSection(e.target.value)}
                            placeholder="Ej: Brazos, Core..."
                            className="flex-1 min-w-0 px-2 py-1 text-sm rounded border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-400 bg-white"
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
