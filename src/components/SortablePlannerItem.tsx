import { useState, useCallback } from 'react';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { PlannedExercise } from '../types';
import { Draggable } from '@hello-pangea/dnd';

interface SortablePlannerItemProps {
    exercise: PlannedExercise;
    index: number;
    onRemove: (id: string) => void;
    onUpdateExercise: (id: string, updates: Partial<PlannedExercise>) => void;
}

export default function SortablePlannerItem({ exercise, index, onRemove, onUpdateExercise }: SortablePlannerItemProps) {
    const { id, name, section, description } = exercise;
    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleNameChange = useCallback((newName: string) => {
        onUpdateExercise(id, { name: newName });
    }, [id, onUpdateExercise]);

    const handleSectionChange = useCallback((newSection: string) => {
        onUpdateExercise(id, { section: newSection });
    }, [id, onUpdateExercise]);

    const handleDescriptionChange = useCallback((newDescription: string) => {
        onUpdateExercise(id, { description: newDescription });
    }, [id, onUpdateExercise]);

    return (
        <Draggable draggableId={id} index={index} isDragDisabled={isEditing}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`
                        bg-white border rounded-xl mb-3 shadow-sm group
                        ${snapshot.isDragging ? 'shadow-xl ring-2 ring-pink-500 z-50' : 'border-pink-100'}
                    `}
                >
                    <div className="p-4 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">{section}</span>
                            </div>

                            {isEditing ? (
                                <div className="space-y-3 mt-2">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nombre del ejercicio</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            className="w-full text-lg font-medium text-pink-950 bg-pink-50/50 border border-pink-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                            autoFocus
                                            onBlur={() => {
                                                // Small delay to allow clicking other inputs
                                                setTimeout(() => {
                                                    if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                                                        // setIsEditing(false);
                                                    }
                                                }, 100);
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Sección / Categoría</label>
                                        <input
                                            type="text"
                                            value={section}
                                            onChange={(e) => handleSectionChange(e.target.value)}
                                            className="w-full text-sm font-medium text-pink-900/70 bg-pink-50/50 border border-pink-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Notas / Descripción</label>
                                        <textarea
                                            value={description || ''}
                                            onChange={(e) => handleDescriptionChange(e.target.value)}
                                            placeholder="Añade notas sobre este ejercicio..."
                                            className="w-full text-sm text-gray-600 bg-pink-50/50 border border-pink-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 min-h-[80px] resize-y"
                                        />
                                    </div>

                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="w-full bg-pink-500 text-white text-sm font-bold py-2 rounded-lg hover:bg-pink-600 transition-colors shadow-sm"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-lg font-medium text-pink-950 leading-tight break-words" onClick={() => setIsEditing(true)}>
                                        {name}
                                    </h3>
                                    {description && !isExpanded && (
                                        <p className="text-sm text-gray-500 line-clamp-1 italic">{description}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className={`p-2 rounded-full transition-all ${isExpanded ? 'bg-pink-50 text-pink-600' : 'text-gray-400 hover:text-pink-600 hover:bg-pink-50'}`}
                                title={isExpanded ? "Contraer" : "Ver detalles"}
                            >
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                            <button
                                onClick={() => onRemove(id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                title="Eliminar de la clase"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {isExpanded && !isEditing && (
                        <div className="px-4 pb-4 pt-1 border-t border-pink-50">
                            <div className="bg-pink-50/30 rounded-lg p-3">
                                <label className="text-[10px] font-bold text-pink-300 uppercase mb-2 block tracking-widest">Notas del ejercicio</label>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {description || 'Sin notas adicionales.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
}
