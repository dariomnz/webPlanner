import { useState, useRef, useCallback } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Exercise } from '../../types';
import { Draggable } from '@hello-pangea/dnd';
import { AutoResizeTextarea } from '../Common/AutoResizeTextarea';

interface DraggableExerciseProps {
    exercise: Exercise;
    index: number;
    onAdd: (exercise: Exercise) => void;
    onDelete: (id: string) => void;
    onRename: (id: string, newName: string) => void;
    onUpdate: (id: string, updates: Partial<Exercise>) => void;
    isEditMode: boolean;
}

export const DraggableExercise = function DraggableExercise({
    exercise,
    index,
    onAdd,
    onDelete,
    onRename,
    onUpdate,
    isEditMode
}: DraggableExerciseProps) {
    const { id, name, description } = exercise;
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(name);
    const [newDescription, setNewDescription] = useState(description || '');
    const [isExpanded, setIsExpanded] = useState(false);

    const formRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const nameRef = useRef<HTMLTextAreaElement>(null);


    // Sync local state with exercise props when they change (synchronization during render)
    const [prevName, setPrevName] = useState(name);
    const [prevDescription, setPrevDescription] = useState(description);

    if (name !== prevName || description !== prevDescription) {
        setPrevName(name);
        setPrevDescription(description);
        setNewName(name);
        setNewDescription(description || '');
    }


    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        if (isEditMode) {
            e.stopPropagation();
            setIsRenaming(true);
        }
    }, [isEditMode]);

    const handleRenameSubmit = useCallback(() => {
        if (newName.trim() && newName !== name) {
            onRename(id, newName.trim());
        }
        if (newDescription.trim() !== (description || '')) {
            onUpdate(id, { description: newDescription.trim() });
        }
        setIsRenaming(false);
        setNewName(name);
        setNewDescription(description || '');
    }, [newName, name, onRename, id, newDescription, description, onUpdate]);

    const handleBlur = useCallback((e: React.FocusEvent) => {
        if (formRef.current && formRef.current.contains(e.relatedTarget as Node)) {
            return;
        }
        handleRenameSubmit();
    }, [handleRenameSubmit]);

    return (
        <Draggable draggableId={`menu-${id}`} index={index} isDragDisabled={isRenaming}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => !isEditMode && onAdd(exercise)}
                    onDoubleClick={handleDoubleClick}
                    className={`
                        flex flex-col p-2 mb-2 bg-white rounded-lg shadow-sm border text-sm group
                        ${snapshot.isDragging ? 'shadow-xl ring-2 ring-pink-500 z-[100]' : 'border-pink-100 hover:border-pink-300'}
                        ${isEditMode ? 'border-pink-200' : ''}
                    `}
                >
                    <div className="flex items-center w-full">
                        {isRenaming ? (
                            <div ref={formRef} className="flex-1 flex flex-col space-y-3 mt-1">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nombre del ejercicio</label>
                                    <AutoResizeTextarea
                                        ref={nameRef}
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        onBlur={handleBlur}
                                        className="w-full px-3 py-2 text-sm bg-pink-50/50 border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                                        autoFocus
                                        placeholder="Nombre del ejercicio"
                                        rows={1}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Descripción (opcional)</label>
                                    <AutoResizeTextarea
                                        ref={textareaRef}
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        onBlur={handleBlur}
                                        className="w-full px-3 py-2 text-xs bg-pink-50/50 border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                                        placeholder="Añade una descripción..."
                                    />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRenameSubmit();
                                    }}
                                    className="w-full bg-pink-500 text-white text-sm font-bold py-2 rounded-lg hover:bg-pink-600 transition-colors shadow-sm"
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
                                            className="p-0.5 text-pink-300 hover:text-pink-500 hover:bg-pink-50 rounded transition-colors flex-shrink-0"
                                            title={isExpanded ? "Ocultar descripción" : "Ver descripción"}
                                        >
                                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>
                                    )}
                                    <span className="text-gray-700 font-medium break-words leading-tight">{name}</span>
                                </div>
                            </div>
                        )}
                        {isEditMode && !isRenaming && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded group-hover:opacity-100 transition-all ml-2 flex-shrink-0"
                                title="Eliminar ejercicio"
                            >
                                <Trash2 size={13} />
                            </button>
                        )}
                    </div>
                    {!isRenaming && isExpanded && description && (
                        <div className="mt-2 text-xs text-gray-500 pl-6 pr-2 whitespace-pre-wrap border-t border-pink-50 pt-1">
                            {description}
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};
