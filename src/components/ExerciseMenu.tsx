import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Plus, GripVertical } from 'lucide-react';
import { Exercise } from '../types';

interface DraggableExerciseProps {
    id: string;
    name: string;
    onAdd: (exercise: Exercise) => void;
}

export function DraggableExercise({ id, name, onAdd }: DraggableExerciseProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `menu-${id}`,
        data: { type: 'menu-item', name, id },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={() => onAdd({ id, name })}
            className="flex items-center p-3 mb-2 bg-white rounded-lg shadow-sm border border-pink-200 cursor-grab active:cursor-grabbing hover:border-pink-400 hover:shadow-md transition-all"
        >
            <GripVertical className="w-4 h-4 text-pink-400 mr-2" />
            <span className="text-gray-800 font-medium">{name}</span>
        </div>
    );
}

interface ExerciseMenuProps {
    exercises: Exercise[];
    onAddExercise: (name: string) => void;
    onAddToPlan: (exercise: Exercise) => void;
}

export default function ExerciseMenu({ exercises, onAddExercise, onAddToPlan }: ExerciseMenuProps) {
    const [newExercise, setNewExercise] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newExercise.trim()) {
            onAddExercise(newExercise.trim());
            setNewExercise('');
        }
    };

    return (
        <div className="w-80 bg-white border-r border-pink-200 h-screen flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
            <div className="p-6 border-b border-pink-100 bg-pink-50/30">
                <h2 className="text-2xl font-serif text-pink-950 mb-4 font-semibold">Ejercicios</h2>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={newExercise}
                        onChange={(e) => setNewExercise(e.target.value)}
                        placeholder="Nuevo ejercicio..."
                        className="flex-1 px-3 py-2 rounded-md border border-beige-300 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                    />
                    <button
                        type="submit"
                        className="p-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {exercises.map((ex) => (
                    <DraggableExercise
                        key={ex.id}
                        id={ex.id}
                        name={ex.name}
                        onAdd={onAddToPlan}
                    />
                ))}
            </div>
        </div>
    );
}
