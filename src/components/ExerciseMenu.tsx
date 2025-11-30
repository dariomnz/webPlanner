import { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Plus, GripVertical, ChevronDown, ChevronRight, FolderPlus, Trash2, Pencil, Calendar } from 'lucide-react';
import { Exercise } from '../types';

interface DraggableExerciseProps {
    exercise: Exercise;
    onAdd: (exercise: Exercise) => void;
    onDelete: (id: string) => void;
    onRename: (id: string, newName: string) => void;
    isEditMode: boolean;
}

export function DraggableExercise({ exercise, onAdd, onDelete, onRename, isEditMode }: DraggableExerciseProps) {
    const { id, name, section } = exercise;
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(name);
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: `menu-${id}`,
        data: { type: 'menu-item', name, section, id },
        disabled: isRenaming, // Disable dragging while renaming
    });

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (isEditMode) {
            e.stopPropagation();
            setIsRenaming(true);
        }
    };

    const handleRenameSubmit = () => {
        if (newName.trim() && newName !== name) {
            onRename(id, newName.trim());
        }
        setIsRenaming(false);
        setNewName(name);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRenameSubmit();
        } else if (e.key === 'Escape') {
            setIsRenaming(false);
            setNewName(name);
        }
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={() => onAdd(exercise)}
            className="flex items-center p-2 mb-2 bg-white rounded-md shadow-sm border border-pink-100 cursor-grab active:cursor-grabbing hover:border-pink-300 hover:shadow-md transition-all text-sm group"
            onDoubleClick={handleDoubleClick}
        >
            <GripVertical className="w-4 h-4 text-pink-300 mr-2 flex-shrink-0" />
            {isRenaming ? (
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-1 py-0.5 text-sm border border-pink-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <span className="text-gray-700 font-medium truncate flex-1">{name}</span>
            )}
            {isEditMode && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded group-hover:opacity-100 transition-all"
                    title="Eliminar ejercicio"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}

interface SectionProps {
    title: string;
    exercises: Exercise[];
    onAddExercise: (name: string, section: string) => void;
    onAddToPlan: (exercise: Exercise) => void;
    onDeleteExercise: (id: string) => void;
    onDeleteSection?: (section: string) => void;
    onRenameSection?: (oldName: string, newName: string) => void;
    onRenameExercise: (id: string, newName: string) => void;
    isEditMode: boolean;
}

function Section({ title, exercises, onAddExercise, onAddToPlan, onDeleteExercise, onDeleteSection, onRenameSection, onRenameExercise, isEditMode }: SectionProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [newExercise, setNewExercise] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isRenamingSection, setIsRenamingSection] = useState(false);
    const [newSectionName, setNewSectionName] = useState(title);

    // Make section droppable in edit mode
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
                className={`flex items-center justify-between mb-2 cursor-pointer group transition-colors ${isOver && isEditMode ? 'bg-pink-50 rounded-lg p-2' : ''
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
                        isEditMode={isEditMode}
                    />
                )}
            </div>
        </div>
    );
}
