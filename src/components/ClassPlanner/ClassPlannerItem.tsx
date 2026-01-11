import { useState, useCallback, useRef, FocusEvent } from 'react';
import { Trash2, ChevronDown, ChevronRight } from '../Common/Icons';
import { Draggable } from '@hello-pangea/dnd';
import { AutoResizeTextarea } from '../Common/AutoResizeTextarea';
import { useStoreItem } from '../../hooks/useDataStore';
import { dataStore } from '../../store/DataStore';

interface SortablePlannerItemProps {
    isEditMode: boolean;
    exerciseId: string;
    index: number;
}

export default function ClassPlannerItem({ isEditMode, exerciseId, index }: SortablePlannerItemProps) {
    const exercise = useStoreItem(exerciseId, () => dataStore.getExercise(exerciseId));

    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleBlur = useCallback((e: FocusEvent) => {
        if (containerRef.current && containerRef.current.contains(e.relatedTarget as Node)) {
            return;
        }
        setIsEditing(false);
    }, []);

    const handleNameChange = useCallback((newName: string) => {
        dataStore.updateExercise(exerciseId, { name: newName });
    }, [exerciseId]);

    const handleSectionChange = useCallback((newSection: string) => {
        dataStore.updateExercise(exerciseId, { section: newSection });
    }, [exerciseId]);

    const handleDescriptionChange = useCallback((newDescription: string) => {
        dataStore.updateExercise(exerciseId, { description: newDescription });
    }, [exerciseId]);

    const handleRemove = useCallback(() => {
        dataStore.removePlannedExercise(exerciseId);
    }, [exerciseId]);

    if (!exercise) return null;
    const { id, name, section, description } = exercise;

    return (
        <Draggable draggableId={id} index={index} isDragDisabled={isEditing || isEditMode}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`
                        bg-white border rounded-xl p-2 mb-1 shadow-sm group
                        ${snapshot.isDragging ? 'shadow-xl ring-2 ring-pink-500 z-50' : 'border-pink-100'}
                    `}
                    onDoubleClick={() => { if (!isEditing) setIsEditing(true) }}
                >
                    <div className="flex items-center gap-2" >
                        {!isEditing && description && (
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
                        <div className="flex-1 min-w-0">
                            {!isEditing && <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-pink-400 tracking-wider">{section}</span>
                            </div>}

                            {isEditing ? (
                                <div ref={containerRef} className="space-y-3 mt-2">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nombre del ejercicio</label>
                                        <AutoResizeTextarea
                                            value={name}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            onBlur={handleBlur}
                                            className="w-full text-lg font-medium text-pink-950 bg-pink-50/50 border border-pink-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Sección / Categoría</label>
                                        <AutoResizeTextarea
                                            value={section}
                                            onChange={(e) => handleSectionChange(e.target.value)}
                                            onBlur={handleBlur}
                                            className="w-full text-sm font-medium text-pink-900/70 bg-pink-50/50 border border-pink-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Notas / Descripción</label>
                                        <AutoResizeTextarea
                                            value={description || ''}
                                            onChange={(e) => handleDescriptionChange(e.target.value)}
                                            onBlur={handleBlur}
                                            placeholder="Añade notas sobre este ejercicio..."
                                            className="w-full text-sm text-gray-600 bg-pink-50/50 border border-pink-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 min-h-[40px]"
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
                                    <h3 className="text-lg font-medium text-pink-950 leading-tight break-words">
                                        {name}
                                    </h3>
                                </div>
                            )}
                        </div>

                        {!isEditing && <button
                            onClick={handleRemove}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            title="Eliminar de la clase"
                        >
                            <Trash2 size={16} />
                        </button>}
                    </div>

                    {isExpanded && !isEditing && description && (
                        <div className="mt-1 text-sm text-gray-600 whitespace-pre-wrap border-t border-pink-50 pt-2 ml-2">
                            {description}
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
}