import { useState, useRef, useCallback } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from '../Common/Icons';
import { Draggable } from '@hello-pangea/dnd';
import { AutoResizeTextarea } from '../Common/AutoResizeTextarea';
import { useStoreItem } from '../../hooks/useDataStore';
import { dataStore } from '../../store/DataStore';
import { createPlannedExercise } from '../../utils/exerciseHelpers';
import ConfirmationModal from '../Common/ConfirmationModal';

interface MenuExerciseItemProps {
    exerciseId: string;
    index: number;
    isEditMode: boolean;
}

export default function MenuExerciseItem({
    exerciseId,
    index,
    isEditMode
}: MenuExerciseItemProps) {
    const exercise = useStoreItem(exerciseId, () => dataStore.getExercise(exerciseId));

    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);
    const handleCloseDeleteExerciseModal = useCallback(() => setExerciseToDelete(null), [setExerciseToDelete]);
    const confirmDeleteExercise = useCallback(() => {
        if (exerciseToDelete) {
            dataStore.removeExercise(exerciseToDelete);
            setExerciseToDelete(null);
        }
    }, [exerciseToDelete, setExerciseToDelete]);

    const formRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const nameRef = useRef<HTMLTextAreaElement>(null);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        if (isEditMode) {
            e.stopPropagation();
            setIsEditing(true);
        }
    }, [isEditMode]);

    const handleAdd = useCallback(() => {
        if (isEditMode) return;
        dataStore.addPlannedExercise(createPlannedExercise(exercise!));
    }, [isEditMode, exercise]);


    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dataStore.updateExercise(exerciseId, { name: e.target.value });
    }, [exerciseId]);
    const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dataStore.updateExercise(exerciseId, { description: e.target.value });
    }, [exerciseId]);

    const handleEditSubmit = useCallback(() => {
        if (exercise) {
            dataStore.updateExercise(exercise.id, { name: exercise.name.trim(), description: exercise.description?.trim() });
        }
        setIsEditing(false);
    }, [exercise]);

    const handleBlur = useCallback((e: React.FocusEvent) => {
        if (formRef.current && formRef.current.contains(e.relatedTarget as Node)) {
            return;
        }
        handleEditSubmit();
    }, [handleEditSubmit]);

    if (!exercise) return null;
    const { id, name, description } = exercise;

    return (
        <>
            <Draggable draggableId={`menu-${id}`} index={index} isDragDisabled={isEditing}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => !isEditMode && handleAdd()}
                        onDoubleClick={handleDoubleClick}
                        className={`
                        flex flex-col p-2 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border text-sm group transition-all duration-200
                        ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary-500 z-[100]' : 'border-primary-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'}
                        ${isEditMode && !snapshot.isDragging ? 'border-primary-200 dark:border-primary-900/50' : ''}
                    `}
                    >
                        <div className="flex items-center w-full">
                            {isEditing ? (
                                <div ref={formRef} className="flex-1 flex flex-col space-y-3 mt-1">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nombre del ejercicio</label>
                                        <AutoResizeTextarea
                                            ref={nameRef}
                                            value={name}
                                            onChange={handleNameChange}
                                            onBlur={handleBlur}
                                            className="w-full px-3 py-2 text-sm bg-primary-50/50 dark:bg-gray-950/50 border border-primary-100 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/50 text-gray-900 dark:text-gray-100"
                                            autoFocus
                                            placeholder="Nombre del ejercicio"
                                            rows={1}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Descripción (opcional)</label>
                                        <AutoResizeTextarea
                                            ref={textareaRef}
                                            value={description!}
                                            onChange={handleDescriptionChange}
                                            onBlur={handleBlur}
                                            className="w-full px-3 py-2 text-xs bg-primary-50/50 dark:bg-gray-950/50 border border-primary-100 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/50 text-gray-600 dark:text-gray-400"
                                            placeholder="Añade una descripción..."
                                        />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditSubmit();
                                        }}
                                        className="w-full bg-primary-500 text-white text-sm font-bold py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 min-w-0 flex items-center justify-between">
                                    <div className="flex items-center gap-1 min-w-0 flex-1">
                                        {description && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsExpanded(!isExpanded);
                                                }}
                                                className="p-0.5 text-primary-300 dark:text-primary-500 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700/50 rounded transition-colors flex-shrink-0"
                                                title={isExpanded ? "Ocultar descripción" : "Ver descripción"}
                                            >
                                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </button>
                                        )}
                                        <span className="text-gray-700 dark:text-gray-200 font-medium break-words leading-tight">{name}</span>
                                    </div>
                                </div>
                            )}
                            {isEditMode && !isEditing && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setExerciseToDelete(id);
                                    }}
                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded group-hover:opacity-100 transition-all ml-2 flex-shrink-0"
                                    title="Eliminar ejercicio"
                                >
                                    <Trash2 size={13} />
                                </button>
                            )}
                        </div>
                        {!isEditing && isExpanded && description && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 pl-6 pr-2 whitespace-pre-wrap border-t border-primary-50 dark:border-gray-700 pt-1">
                                {description}
                            </div>
                        )}
                    </div>
                )}
            </Draggable>

            <ConfirmationModal
                isOpen={!!exerciseToDelete}
                onClose={handleCloseDeleteExerciseModal}
                onConfirm={confirmDeleteExercise}
                title="¿Eliminar ejercicio?"
                message="¿Estás seguro de que quieres eliminar este ejercicio de la biblioteca? Se mantendrá en las clases ya planificadas pero no podrás volver a añadirlo."
            />
        </>
    );
}
