import { useState, useCallback } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2 } from '../Icons';
import { Exercise } from '../../types';
import { DraggableExercise } from './DraggableExercise';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { AutoResizeTextarea } from '../Common/AutoResizeTextarea';

interface SectionProps {
    title: string;
    index: number;
    exercises: Exercise[];
    onAddExercise: (name: string, section: string, group: string) => void;
    onAddToPlan: (exercise: Exercise) => void;
    onDeleteExercise: (id: string) => void;
    onDeleteSection: (section: string) => void;
    onRenameSection: (oldName: string, newName: string) => void;
    onRenameExercise: (id: string, newName: string) => void;
    onUpdateExercise: (id: string, updates: Partial<Exercise>) => void;
    isEditMode: boolean;
    currentGroup: string;
}

export const Section = function Section({
    title,
    index,
    exercises,
    onAddExercise,
    onAddToPlan,
    onDeleteExercise,
    onDeleteSection,
    onRenameSection,
    onRenameExercise,
    onUpdateExercise,
    isEditMode,
    currentGroup
}: SectionProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [newExercise, setNewExercise] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isRenamingSection, setIsRenamingSection] = useState(false);
    const [newSectionName, setNewSectionName] = useState(title);

    const sectionId = `section-${currentGroup}-${title}`;

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (newExercise.trim()) {
            onAddExercise(newExercise.trim(), title, currentGroup);
            setNewExercise('');
            setIsAdding(false);
        }
    }, [newExercise, onAddExercise, title, currentGroup]);

    const handleSectionDoubleClick = useCallback((e: React.MouseEvent) => {
        if (isEditMode) {
            e.stopPropagation();
            setIsRenamingSection(true);
        }
    }, [isEditMode, setIsRenamingSection]);

    const handleSectionRenameSubmit = useCallback(() => {
        if (newSectionName.trim() && newSectionName !== title) {
            onRenameSection(title, newSectionName.trim());
        }
        setIsRenamingSection(false);
        setNewSectionName(title);
    }, [newSectionName, title, onRenameSection, setIsRenamingSection, setNewSectionName]);


    return (
        <Draggable draggableId={sectionId} index={index} isDragDisabled={!isEditMode || isRenamingSection}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`mb-4 ${snapshot.isDragging ? 'z-50' : ''}`}
                >
                    <div
                        {...provided.dragHandleProps}
                        className={`flex items-center justify-between p-1 cursor-pointer group rounded-lg bg-pink-50/50 hover:bg-pink-100 ${snapshot.isDragging ? 'bg-pink-100' : 'transition-colors'}`}
                        onClick={() => setIsOpen(!isOpen)}
                        onDoubleClick={handleSectionDoubleClick}
                    >
                        <div className={`flex flex-col text-pink-900 font-semibold w-full ${isRenamingSection ? 'p-2' : ''}`}>
                            <div className="flex items-center">
                                {!isRenamingSection && (
                                    <>
                                        {isOpen ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                                        <span>{title}</span>
                                        <span className="ml-2 text-xs text-pink-400 font-normal bg-white px-2 py-0.5 rounded-full border border-pink-100">
                                            {exercises.length}
                                        </span>
                                    </>
                                )}
                            </div>

                            {isRenamingSection && (
                                <div className="mt-2 space-y-3 w-full" onClick={(e) => e.stopPropagation()}>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nombre de la sección</label>
                                        <AutoResizeTextarea
                                            value={newSectionName}
                                            onChange={(e) => setNewSectionName(e.target.value)}
                                            onBlur={handleSectionRenameSubmit}
                                            className="w-full px-3 py-2 text-sm bg-white border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                                            autoFocus
                                            rows={1}
                                        />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSectionRenameSubmit();
                                        }}
                                        className="w-full bg-pink-500 text-white text-sm font-bold py-2 rounded-lg hover:bg-pink-600 transition-colors shadow-sm"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            )}
                        </div>
                        {isEditMode && !isRenamingSection && (
                            <div className="flex items-center">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAdding(!isAdding);
                                        setIsOpen(true);
                                    }}
                                    className="p-1 text-pink-400 hover:text-pink-600 hover:bg-white rounded transition-all"
                                    title="Añadir ejercicio"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteSection(title);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-white rounded transition-all ml-1"
                                    title="Eliminar sección"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {isOpen && (
                        <Droppable droppableId={`droppable-section-${currentGroup}-${title}`} type="EXERCISE" isDropDisabled={!isEditMode}>
                            {(exerciseProvided, exerciseSnapshot) => (
                                <div
                                    ref={exerciseProvided.innerRef}
                                    {...exerciseProvided.droppableProps}
                                    className={`pl-2 border-l-2 border-pink-100 ml-2 mt-2 min-h-[5px] transition-colors ${exerciseSnapshot.isDraggingOver ? 'bg-pink-50/30' : ''}`}
                                >
                                    {isAdding && (
                                        <form onSubmit={handleSubmit} className="mb-2 flex gap-2">
                                            <input
                                                type="text"
                                                value={newExercise}
                                                onChange={(e) => setNewExercise(e.target.value)}
                                                placeholder="Nombre del ejercicio..."
                                                className="flex-1 min-w-0 px-2 py-1 text-sm rounded border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-400"
                                                onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
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

                                    {exercises.map((ex, exIndex) => (
                                        <DraggableExercise
                                            key={ex.id}
                                            index={exIndex}
                                            exercise={ex}
                                            onAdd={onAddToPlan}
                                            onDelete={onDeleteExercise}
                                            onRename={onRenameExercise}
                                            onUpdate={onUpdateExercise}
                                            isEditMode={isEditMode}
                                        />
                                    ))}
                                    {exerciseProvided.placeholder}
                                    {exercises.length === 0 && !isAdding && (
                                        <div className="text-xs text-gray-400 italic py-1">No hay ejercicios</div>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    )}
                </div>
            )}
        </Draggable>
    );
};
