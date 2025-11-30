
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { PlannedExercise } from '../types';

interface SortablePlannerItemProps {
    exercise: PlannedExercise;
    onRemove: (id: string) => void;
}

export default function SortablePlannerItem({ exercise, onRemove }: SortablePlannerItemProps) {
    const id = exercise.id;
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
            className="flex items-center justify-between p-1 mb-1 bg-white rounded-xl shadow-sm border border-pink-200 group hover:shadow-md hover:border-pink-300 transition-all"
        >
            <div className="flex items-center flex-1 space-x-2">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:bg-pink-50 rounded-md mr-3 text-pink-400">
                    <GripVertical className="w-5 h-5" />
                </div>
                <span className="text-lg text-pink-900 font-medium">{exercise.section}:</span>
                <span className="text-lg text-gray-900 font-medium">{exercise.name}</span>
            </div>
            <button
                onClick={() => onRemove(id)}
                className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors group-hover:opacity-100"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}
