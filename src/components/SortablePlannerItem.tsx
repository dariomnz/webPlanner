import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { PlannedExercise } from '../types';

interface SortablePlannerItemProps {
    exercise: PlannedExercise;
    onRemove: (id: string) => void;
    onUpdateExercise: (id: string, updates: Partial<PlannedExercise>) => void;
}

export default function SortablePlannerItem({ exercise, onRemove, onUpdateExercise }: SortablePlannerItemProps) {
    const id = exercise.id;
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(exercise.name);
    const [editSection, setEditSection] = useState(exercise.section);
    const [editDescription, setEditDescription] = useState(exercise.description || '');

    const formRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        disabled: isEditing
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging || exercise.isPreview ? 0.5 : 1,
    };

    const updateDescriptionsize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        updateDescriptionsize();
    }, [isEditing, editDescription]);

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditName(exercise.name);
        setEditSection(exercise.section);
        setEditDescription(exercise.description || '');
    };

    const handleSubmit = () => {
        setIsEditing(false);
        const updates: Partial<PlannedExercise> = {};

        if (editName.trim() !== '' && editName !== exercise.name) {
            updates.name = editName;
        }

        if (editSection.trim() !== '' && editSection !== exercise.section) {
            updates.section = editSection;
        }

        if (editDescription.trim() !== (exercise.description || '')) {
            updates.description = editDescription.trim();
        }

        if (Object.keys(updates).length > 0) {
            onUpdateExercise(id, updates);
        } else {
            // Reset if cancelled or no changes
            setEditName(exercise.name);
            setEditSection(exercise.section);
            setEditDescription(exercise.description || '');
        }
    };

    const handleBlur = (e: React.FocusEvent) => {
        if (formRef.current && formRef.current.contains(e.relatedTarget as Node)) {
            return;
        }
        handleSubmit();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.target !== textareaRef.current) {
            handleSubmit();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditName(exercise.name);
            setEditSection(exercise.section);
            setEditDescription(exercise.description || '');
        }
    };

    return (
        <div
            ref={setNodeRef}
            onDoubleClick={handleDoubleClick}
            style={style}
            {...attributes} {...listeners}
            className="flex flex-col p-1 mb-1 bg-white rounded-xl shadow-sm border border-pink-200 group hover:shadow-md hover:border-pink-300 transition-all cursor-grab active:cursor-grabbing p-2 hover:bg-pink-50 rounded-md mr-1 text-pink-400 flex-shrink-0"
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center flex-1 space-x-2">
                    {!isEditing && exercise.description && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="p-1 text-pink-300 hover:text-pink-500 hover:bg-pink-50 rounded transition-colors flex-shrink-0"
                            title={isExpanded ? "Ocultar descripción" : "Ver descripción"}
                        >
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                    )}

                    <div className="flex items-center gap-2 flex-1">
                        {isEditing ? (
                            <div ref={formRef} className="flex-1 flex flex-col gap-1 w-full">
                                <div className="flex items-center gap-1 w-full">
                                    <input
                                        type="text"
                                        value={editSection}
                                        onChange={(e) => setEditSection(e.target.value)}
                                        onBlur={handleBlur}
                                        onKeyDown={handleKeyDown}
                                        className="text-lg text-pink-900 font-medium flex-1 ml-1 mr-1 mt-1 bg-white border border-pink-300 rounded px-1 focus:outline-none focus:ring-2 focus:ring-pink-400"
                                        onClick={(e) => e.stopPropagation()}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        placeholder="Sección"
                                        style={{ width: '120px' }}
                                    />
                                    <span className="text-lg text-pink-900 font-medium">:</span>
                                </div>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                    className="text-lg text-gray-900 font-medium w-full ml-1 mr-1 bg-white border border-pink-300 rounded px-1 focus:outline-none focus:ring-2 focus:ring-pink-400"
                                    onClick={(e) => e.stopPropagation()}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    placeholder="Nombre"
                                />
                                <textarea
                                    ref={textareaRef}
                                    value={editDescription}
                                    onChange={(e) => { setEditDescription(e.target.value); }}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
                                    className="w-full px-1 py-1 text-sm text-gray-600 ml-1 mr-1 mb-1 border border-pink-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none overflow-hidden bg-white"
                                    onClick={(e) => e.stopPropagation()}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    placeholder="Descripción (opcional)"
                                />
                            </div>
                        ) : (
                            <>
                                <span className="text-lg text-pink-900 font-medium whitespace-nowrap">{exercise.section}:</span>
                                <span
                                    className="text-lg text-gray-900 font-medium truncate cursor-text hover:bg-pink-100/50 rounded px-1 transition-colors"
                                    title="Doble click para editar"
                                >
                                    {exercise.name}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {!isEditing && (
                    <button
                        onClick={() => onRemove(id)}
                        className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors group-hover:opacity-100 flex-shrink-0"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            {!isEditing && isExpanded && exercise.description && (
                <div className="mt-1 text-sm text-gray-600 whitespace-pre-wrap border-t border-pink-50 pt-2 ml-2">
                    {exercise.description}
                </div>
            )}
        </div>
    );
}
