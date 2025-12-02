import { useState, useMemo, useEffect } from 'react';
import { Plus, FolderPlus, Calendar, Pencil, Download, Upload, Tag, Trash2 } from 'lucide-react';
import { Exercise, Section as SectionType } from '../../types';
import { Section } from './Section';

interface ExerciseMenuProps {
    exercises: Exercise[];
    sections: SectionType[];
    groups: string[];
    setGroups: (groups: string[] | ((prev: string[]) => string[])) => void;
    onAddExercise: (name: string, section: string, group?: string) => void;
    onAddSection: (sectionName: string, group: string) => void;
    onAddToPlan: (exercise: Exercise) => void;
    onDeleteExercise: (id: string) => void;
    onDeleteSection: (sectionName: string, group: string) => void;
    onDeleteGroup: (group: string) => void;
    onMoveExerciseToSection: (exerciseId: string, newSection: string) => void;
    onRenameExercise: (exerciseId: string, newName: string) => void;
    onUpdateExercise: (exerciseId: string, updates: Partial<Exercise>) => void;
    onRenameSection: (oldName: string, newName: string, group: string) => void;
    isEditMode: boolean;
    onEditModeChange: (isEditMode: boolean) => void;
    isVisible: boolean;
    onExportExercises: () => void;
    onImportExercises: (file: File) => void;
}

const DEFAULT_GROUP = 'General';

export default function ExerciseMenu({
    exercises,
    sections,
    groups,
    setGroups,
    onAddExercise,
    onAddSection,
    onAddToPlan,
    onDeleteExercise,
    onDeleteSection,
    onDeleteGroup,
    onMoveExerciseToSection,
    onRenameExercise,
    onUpdateExercise,
    onRenameSection,
    isEditMode,
    onEditModeChange,
    isVisible,
    onExportExercises,
    onImportExercises
}: ExerciseMenuProps) {
    const [newSection, setNewSection] = useState('');
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<string>(DEFAULT_GROUP);
    const [newGroup, setNewGroup] = useState('');
    const [isAddingGroup, setIsAddingGroup] = useState(false);

    // Asegurarse de que el grupo seleccionado existe
    useEffect(() => {
        if (groups.length > 0 && !groups.includes(selectedGroup)) {
            setSelectedGroup(groups[0]);
        } else if (groups.length === 0 && selectedGroup !== '') {
            setSelectedGroup('');
        }
    }, [groups, selectedGroup]);

    // Filtrar ejercicios y secciones por grupo seleccionado
    const filteredExercises = useMemo(() => {
        if (!selectedGroup) return [];
        return exercises.filter(ex => {
            const exerciseGroup = ex.group || DEFAULT_GROUP;
            return exerciseGroup === selectedGroup;
        });
    }, [exercises, selectedGroup]);

    const filteredSections = useMemo(() => {
        return sections.filter(s => s.group === selectedGroup);
    }, [sections, selectedGroup]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportExercises(file);
        }
        // Reset input value to allow selecting the same file again
        event.target.value = '';
    };

    const handleAddSectionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSection.trim()) {
            onAddSection(newSection.trim(), selectedGroup);
            setNewSection('');
            setIsAddingSection(false);
        }
    };

    const handleAddGroupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGroup.trim() && !groups.includes(newGroup.trim())) {
            setGroups([...groups, newGroup.trim()]);
            setSelectedGroup(newGroup.trim());
            setNewGroup('');
            setIsAddingGroup(false);
        }
    };



    return (
        <div className={`
            w-80 bg-white border-r border-pink-200 h-full flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10
            md:relative md:translate-x-0
            fixed transition-transform duration-300 ease-in-out
            ${isVisible ? 'translate-x-0' : '-translate-x-full'}
        `}>
            <div className="p-4 border-b border-pink-100 bg-pink-50/30">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-serif text-pink-950 font-semibold">Ejercicios</h2>
                    <div className="flex items-center gap-1">
                        {isEditMode && (
                            <div className="flex items-center gap-1 bg-white border border-pink-100 p-1 rounded-lg shadow-sm mr-2">
                                <button
                                    onClick={onExportExercises}
                                    className="p-1.5 rounded-md text-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-all"
                                    title="Guardar ejercicios (Backup)"
                                >
                                    <Download size={16} />
                                </button>
                                <label className="p-1.5 rounded-md text-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-all cursor-pointer" title="Cargar ejercicios">
                                    <Upload size={16} />
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        )}
                        <div className="flex items-center gap-1 bg-white border border-pink-100 p-1 rounded-lg shadow-sm">
                            <button
                                onClick={() => onEditModeChange(false)}
                                className={`p-1.5 rounded-md transition-all ${!isEditMode ? 'bg-pink-100 text-pink-700 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                                title="Modo Planificación"
                            >
                                <Calendar size={16} />
                            </button>
                            <button
                                onClick={() => onEditModeChange(true)}
                                className={`p-1.5 rounded-md transition-all ${isEditMode ? 'bg-pink-100 text-pink-700 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                                title="Modo Edición"
                            >
                                <Pencil size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Selector de grupos */}
                <div className="mb-3">
                    <div className="flex gap-2 items-center">
                        <Tag size={16} className="text-pink-600" />
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white text-pink-900 font-medium"
                        >
                            {groups.map((group: string) => (
                                <option key={group} value={group}>
                                    {group}
                                </option>
                            ))}
                        </select>

                        {isEditMode && (
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setIsAddingGroup(!isAddingGroup)}
                                    className="p-2 text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-lg transition-all border border-pink-200"
                                    title="Añadir nuevo grupo"
                                >
                                    <Plus size={16} />
                                </button>
                                <button
                                    onClick={() => onDeleteGroup(selectedGroup)}
                                    className="p-2 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all border border-red-200"
                                    title={`Eliminar grupo "${selectedGroup}"`}
                                >
                                    <Trash2 size={16} />
                                </button>
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

                {isEditMode && (
                    <button
                        onClick={() => setIsAddingSection(!isAddingSection)}
                        className="w-full flex items-center justify-center gap-2 text-xs font-medium text-pink-600 hover:text-pink-800 bg-white px-3 py-2 rounded-lg border border-pink-200 shadow-sm hover:shadow transition-all"
                    >
                        <FolderPlus className="w-3 h-3" />
                        Nueva Sección
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {isAddingSection && (
                    <form onSubmit={handleAddSectionSubmit} className="mb-6 p-3 bg-pink-50 rounded-lg border border-pink-100">
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

                {filteredSections.map(section => (
                    <Section
                        key={`${section.group}-${section.name}`}
                        title={section.name}
                        exercises={filteredExercises.filter(e => e.section === section.name)}
                        onAddExercise={onAddExercise}
                        onAddToPlan={onAddToPlan}
                        onDeleteExercise={onDeleteExercise}
                        onDeleteSection={(sectionName) => onDeleteSection(sectionName, section.group)}
                        onRenameSection={(oldName, newName) => onRenameSection(oldName, newName, section.group)}
                        onRenameExercise={onRenameExercise}
                        onUpdateExercise={onUpdateExercise}
                        isEditMode={isEditMode}
                        currentGroup={selectedGroup}
                    />
                ))}

                {/* Handle uncategorized exercises if any */}
                {filteredExercises.some(e => !filteredSections.some(s => s.name === e.section)) && (
                    <Section
                        title="Sin Categoría"
                        exercises={filteredExercises.filter(e => !filteredSections.some(s => s.name === e.section))}
                        onAddExercise={onAddExercise}
                        onAddToPlan={onAddToPlan}
                        onDeleteExercise={onDeleteExercise}
                        onRenameExercise={onRenameExercise}
                        onUpdateExercise={onUpdateExercise}
                        isEditMode={isEditMode}
                        currentGroup={selectedGroup}
                    />
                )}
                <div className="md:hidden h-18"></div>
            </div>
        </div>
    );
}
