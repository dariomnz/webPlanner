import { useState, useMemo, useEffect } from 'react';
import { Calendar, Pencil, Download, Upload } from 'lucide-react';
import { Exercise, Section as SectionType } from '../../types';
import { Section } from './Section';
import { GroupSelector } from './GroupSelector';
import { SectionManager } from './SectionManager';

interface ExerciseMenuProps {
    exercises: Exercise[];
    sections: SectionType[];
    groups: string[];
    onAddGroup: (group: string) => void;
    onAddExercise: (name: string, section: string, group: string) => void;
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
    onAddGroup,
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
    const [selectedGroup, setSelectedGroup] = useState<string>(DEFAULT_GROUP);

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

    const handleAddGroup = (groupName: string) => {
        onAddGroup(groupName);
        setSelectedGroup(groupName);
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
                <GroupSelector
                    groups={groups}
                    selectedGroup={selectedGroup}
                    onSelectGroup={setSelectedGroup}
                    onAddGroup={handleAddGroup}
                    onDeleteGroup={onDeleteGroup}
                    isEditMode={isEditMode}
                />

                {/* Gestor de secciones */}
                <SectionManager
                    selectedGroup={selectedGroup}
                    onAddSection={onAddSection}
                    isEditMode={isEditMode}
                />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
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

                {filteredSections.length === 0 && (
                    <div className="text-xs text-gray-400 italic py-1">No hay secciones</div>
                )}

                <div className="md:hidden h-18"></div>
            </div>
        </div>
    );
}
