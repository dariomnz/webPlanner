import { useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { DragData, Exercise } from '../../types';

interface DraggableExerciseProps {
    exercise: Exercise;
    onAdd: (exercise: Exercise) => void;
    onDelete: (id: string) => void;
    onRename: (id: string, newName: string) => void;
    onUpdate: (id: string, updates: Partial<Exercise>) => void;
    isEditMode: boolean;
}

export function DraggableExercise({
    exercise,
    onAdd,
    onDelete,
    onRename,
    onUpdate,
    isEditMode
}: DraggableExerciseProps) {
    const { id, name, section, description } = exercise;
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(name);
    const [newDescription, setNewDescription] = useState(description || '');
    const [isExpanded, setIsExpanded] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    const dragdata: DragData = {
        type: 'menu-item',
        name: name,
        section: section,
        id: id,
        description: description,
    };

    const { attributes, listeners, setNodeRef } = useDraggable({
        id: `menu-${id}`,
        data: dragdata,
        disabled: isRenaming,
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
        if (newDescription.trim() !== (description || '')) {
            onUpdate(id, { description: newDescription.trim() });
        }
        setIsRenaming(false);
        setNewName(name);
        setNewDescription(description || '');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRenameSubmit();
        } else if (e.key === 'Escape') {
            setIsRenaming(false);
            setNewName(name);
            setNewDescription(description || '');
        }
    };

    const handleBlur = (e: React.FocusEvent) => {
        if (formRef.current && formRef.current.contains(e.relatedTarget as Node)) {
            return;
        }
        handleRenameSubmit();
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={() => onAdd(exercise)}
            className="flex flex-col p-2 mb-2 bg-white rounded-md shadow-sm border border-pink-100 cursor-grab active:cursor-grabbing hover:border-pink-300 hover:shadow-md transition-all text-sm group"
            onDoubleClick={handleDoubleClick}
        >
            <div className="flex items-center w-full">
                {isRenaming ? (
                    <div ref={formRef} className="flex-1 flex flex-col gap-1">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="w-full px-1 py-0.5 text-sm border border-pink-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Nombre del ejercicio"
                        />
                        <textarea
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            onBlur={handleBlur}
                            className="w-full px-1 py-0.5 text-xs border border-pink-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400 resize-none"
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Descripción (opcional)"
                            rows={2}
                        />
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
                            <span className="text-gray-700 font-medium truncate">{name}</span>
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
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </div>
            {!isRenaming && isExpanded && description && (
                <div className="mt-2 text-xs text-gray-500 pl-6 pr-2 whitespace-pre-wrap border-t border-pink-50 pt-1">
                    {description}
                </div>
            )}
        </div>
    );
}
