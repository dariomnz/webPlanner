import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';

export default function SortablePlannerItem({ id, name, onRemove, isPreview }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging || isPreview ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between p-4 mb-3 bg-white rounded-xl shadow-sm border border-pink-200 group hover:shadow-md hover:border-pink-300 transition-all"
        >
            <div className="flex items-center flex-1">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:bg-pink-50 rounded-md mr-3 text-pink-400">
                    <GripVertical className="w-5 h-5" />
                </div>
                <span className="text-lg text-gray-900 font-medium">{name}</span>
            </div>
            <button
                onClick={() => onRemove(id)}
                className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}
