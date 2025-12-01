import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { PlannedExercise } from '../types';

interface SortablePlannerItemProps {
    exercise: PlannedExercise;
    onRemove: (id: string) => void;
}

export default function SortablePlannerItem({ exercise, onRemove }: SortablePlannerItemProps) {
    const id = exercise.id;
    const [isExpanded, setIsExpanded] = useState(false);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: isDragging ? undefined : CSS.Translate.toString(transform),
        transition: isDragging ? undefined : transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging || exercise.isPreview ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes} {...listeners}
            className="flex flex-col p-1 mb-1 bg-white rounded-xl shadow-sm border border-pink-200 group hover:shadow-md hover:border-pink-300 transition-all cursor-grab active:cursor-grabbing p-2 hover:bg-pink-50 rounded-md mr-1 text-pink-400 flex-shrink-0"
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center flex-1 space-x-2 min-w-0">
                    {exercise.description && (
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

                    <div className="flex items-center gap-2 truncate">
                        <span className="text-lg text-pink-900 font-medium whitespace-nowrap">{exercise.section}:</span>
                        <span className="text-lg text-gray-900 font-medium truncate">{exercise.name}</span>
                    </div>
                </div>
                <button
                    onClick={() => onRemove(id)}
                    className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors group-hover:opacity-100 flex-shrink-0"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {isExpanded && exercise.description && (
                <div className="mt-1 text-sm text-gray-600 pl-12 pr-4 pb-2 whitespace-pre-wrap border-t border-pink-50 pt-2 ml-2">
                    {exercise.description}
                </div>
            )}
        </div>
    );
}
