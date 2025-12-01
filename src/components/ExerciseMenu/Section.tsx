import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Exercise } from '../../types';
import { DraggableExercise } from './DraggableExercise';

interface SectionProps {
    title: string;
    exercises: Exercise[];
    onAddExercise: (name: string, section: string) => void;
    onAddToPlan: (exercise: Exercise) => void;
    onDeleteExercise: (id: string) => void;
    onDeleteSection?: (section: string) => void;
    onRenameSection?: (oldName: string, newName: string) => void;
    onRenameExercise: (id: string, newName: string) => void;
    onUpdateExercise: (id: string, updates: Partial<Exercise>) => void;
    isEditMode: boolean;
}

export function Section({
    title,
    exercises,
    onAddExercise,
    onAddToPlan,
    onDeleteExercise,
    onDeleteSection,
    onRenameSection,
    onRenameExercise,
    onUpdateExercise,
    isEditMode
}: SectionProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [newExercise, setNewExercise] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isRenamingSection, setIsRenamingSection] = useState(false);
    const [newSectionName, setNewSectionName] = useState(title);

    const { setNodeRef, isOver } = useDroppable({
        id: `section-${title}`,
        disabled: !isEditMode,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newExercise.trim()) {
            onAddExercise(newExercise.trim(), title);
            setNewExercise('');
            setIsAdding(false);
        }
    };

    const handleSectionDoubleClick = (e: React.MouseEvent) => {
        if (isEditMode && onRenameSection) {
            e.stopPropagation();
            setIsRenamingSection(true);
        }
    };

    const handleSectionRenameSubmit = () => {
        if (newSectionName.trim() && newSectionName !== title && onRenameSection) {
            onRenameSection(title, newSectionName.trim());
        }
        setIsRenamingSection(false);
        setNewSectionName(title);
    };

    const handleSectionKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSectionRenameSubmit();
        } else if (e.key === 'Escape') {
            setIsRenamingSection(false);
            setNewSectionName(title);
        }
    };

    return (
        <div className="mb-4" ref={setNodeRef}>
            <div
                className={`flex items-center justify-between p-1 cursor-pointer group transition-colors ${isOver && isEditMode ? 'bg-pink-50 rounded-lg' : ''
                    }`}
                onClick={() => setIsOpen(!isOpen)}
                onDoubleClick={handleSectionDoubleClick}
            >
                <div className="flex items-center text-pink-900 font-semibold">
                    {isOpen ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                    {isRenamingSection ? (
                        <input
                            type="text"
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            onBlur={handleSectionRenameSubmit}
                            onKeyDown={handleSectionKeyDown}
                            className="px-2 py-0.5 text-sm border border-pink-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span>{title}</span>
                    )}
                    <span className="ml-2 text-xs text-pink-400 font-normal bg-pink-50 px-2 py-0.5 rounded-full">
                        {exercises.length}
                    </span>
                </div>
                {isEditMode && (
                    <div className="flex items-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsAdding(!isAdding);
                                setIsOpen(true);
                            }}
                            className="p-1 text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded group-hover:opacity-100 transition-all"
                            title="Añadir ejercicio"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        {onDeleteSection && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSection(title);
                                }}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded group-hover:opacity-100 transition-all ml-1"
                                title="Eliminar sección"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="pl-2 border-l-2 border-pink-100 ml-2">
                    {isAdding && (
                        <form onSubmit={handleSubmit} className="mb-2 flex gap-2">
                            <input
                                type="text"
                                value={newExercise}
                                onChange={(e) => setNewExercise(e.target.value)}
                                placeholder="Nombre del ejercicio..."
                                className="flex-1 min-w-0 px-2 py-1 text-sm rounded border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-400"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="p-1 bg-pink-500 text-white rounded hover:bg-pink-600"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </form>
                    )}

                    {exercises.map((ex) => (
                        <DraggableExercise
                            key={ex.id}
                            exercise={ex}
                            onAdd={onAddToPlan}
                            onDelete={onDeleteExercise}
                            onRename={onRenameExercise}
                            onUpdate={onUpdateExercise}
                            isEditMode={isEditMode}
                        />
                    ))}
                    {exercises.length === 0 && !isAdding && (
                        <div className="text-xs text-gray-400 italic py-1">No hay ejercicios</div>
                    )}
                </div>
            )}
        </div>
    );
}
