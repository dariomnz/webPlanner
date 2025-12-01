import { useState } from 'react';
import { Plus, FolderPlus, Calendar, Pencil } from 'lucide-react';
import { Exercise } from '../../types';
import { Section } from './Section';

interface ExerciseMenuProps {
    exercises: Exercise[];
    sections: string[];
    onAddExercise: (name: string, section: string) => void;
    onAddSection: (section: string) => void;
    onAddToPlan: (exercise: Exercise) => void;
    onDeleteExercise: (id: string) => void;
    onDeleteSection: (section: string) => void;
    onMoveExerciseToSection: (exerciseId: string, newSection: string) => void;
    onRenameExercise: (exerciseId: string, newName: string) => void;
    onUpdateExercise: (exerciseId: string, updates: Partial<Exercise>) => void;
    onRenameSection: (oldName: string, newName: string) => void;
    isEditMode: boolean;
    onEditModeChange: (isEditMode: boolean) => void;
    isVisible: boolean;
}

export default function ExerciseMenu({
    exercises,
    sections,
    onAddExercise,
    onAddSection,
    onAddToPlan,
    onDeleteExercise,
    onDeleteSection,
    onMoveExerciseToSection,
    onRenameExercise,
    onUpdateExercise,
    onRenameSection,
    isEditMode,
    onEditModeChange,
    isVisible
}: ExerciseMenuProps) {
    const [newSection, setNewSection] = useState('');
    const [isAddingSection, setIsAddingSection] = useState(false);

    const handleAddSectionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSection.trim()) {
            onAddSection(newSection.trim());
            setNewSection('');
            setIsAddingSection(false);
        }
    };

    return (
        <div className={`
            w-80 bg-white border-r border-pink-200 h-screen flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10
            md:relative md:translate-x-0
            fixed transition-transform duration-300 ease-in-out
            ${isVisible ? 'translate-x-0' : '-translate-x-full'}
        `}>
            <div className="p-4 border-b border-pink-100 bg-pink-50/30">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-serif text-pink-950 font-semibold">Ejercicios</h2>
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

                {sections.map(section => (
                    <Section
                        key={section}
                        title={section}
                        exercises={exercises.filter(e => e.section === section)}
                        onAddExercise={onAddExercise}
                        onAddToPlan={onAddToPlan}
                        onDeleteExercise={onDeleteExercise}
                        onDeleteSection={onDeleteSection}
                        onRenameSection={onRenameSection}
                        onRenameExercise={onRenameExercise}
                        onUpdateExercise={onUpdateExercise}
                        isEditMode={isEditMode}
                    />
                ))}

                {/* Handle uncategorized exercises if any */}
                {exercises.some(e => !sections.includes(e.section)) && (
                    <Section
                        title="Sin Categoría"
                        exercises={exercises.filter(e => !sections.includes(e.section))}
                        onAddExercise={onAddExercise}
                        onAddToPlan={onAddToPlan}
                        onDeleteExercise={onDeleteExercise}
                        onRenameExercise={onRenameExercise}
                        onUpdateExercise={onUpdateExercise}
                        isEditMode={isEditMode}
                    />
                )}
                <div className="h-24"></div>
            </div>
        </div>
    );
}
