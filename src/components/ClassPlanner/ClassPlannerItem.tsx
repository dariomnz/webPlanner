import { useState, useCallback, useRef, FocusEvent, useEffect, useEffectEvent, MouseEvent } from 'react';
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
    const [isDeleting, setIsDeleting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isNew, setIsNew] = useState(true);
    const setIsNewEvent = useEffectEvent(setIsNew);
    useEffect(() => {
        const timer = setTimeout(() => setIsNewEvent(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleDoubleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (isDeleting) return;
        setIsEditing(true);
    }, [isDeleting, setIsEditing]);

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
        setIsDeleting(true);
    }, []);

    const onAnimationEnd = useCallback(() => {
        if (isDeleting) {
            dataStore.removePlannedExercise(exerciseId);
        }
    }, [isDeleting, exerciseId]);

    if (!exercise) return null;
    const { id, name, section, description } = exercise;

    return (
        <Draggable draggableId={id} index={index} isDragDisabled={isEditing || isEditMode}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-1 transition-shadow ${snapshot.isDragging ? 'z-50' : ''}`}
                    style={provided.draggableProps.style}
                >
                    <div
                        onAnimationEnd={onAnimationEnd}
                        className={`
                            bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm group transition-colors transition-shadow duration-200 
                            ${isNew ? 'animate-zoom-in' : ''}
                            ${isDeleting ? 'animate-zoom-out' : ''}
                            ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary-500 scale-105' : 'border border-primary-100 dark:border-gray-800'}
                        `}
                        onDoubleClick={handleDoubleClick}
                    >
                        <div className="flex items-center gap-2" >
                            {!isEditing && description && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded) }}
                                    className="p-1 text-primary-300 dark:text-primary-500 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
                                    title={isExpanded ? "Ocultar descripción" : "Ver descripción"}
                                >
                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </button>
                            )}
                            <div className="flex-1 min-w-0">
                                {!isEditing && <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-primary-600 tracking-wider uppercase">{section}</span>
                                </div>}

                                {isEditing ? (
                                    <div ref={containerRef} className="space-y-1">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Sección / Categoría</label>
                                            <AutoResizeTextarea
                                                value={section}
                                                onChange={(e) => { e.stopPropagation(); handleSectionChange(e.target.value) }}
                                                onBlur={handleBlur}
                                                className="w-full text-sm font-medium text-primary-900/70 dark:text-primary-300/70 bg-primary-50/50 dark:bg-gray-950/50 border border-primary-100 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nombre del ejercicio</label>
                                            <AutoResizeTextarea
                                                value={name}
                                                onChange={(e) => { e.stopPropagation(); handleNameChange(e.target.value) }}
                                                onBlur={handleBlur}
                                                className="w-full text-lg font-medium text-primary-950 dark:text-primary-100 bg-primary-50/50 dark:bg-gray-950/50 border border-primary-100 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                                autoFocus
                                                rows={1}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Notas / Descripción</label>
                                            <AutoResizeTextarea
                                                value={description || ''}
                                                onChange={(e) => { e.stopPropagation(); handleDescriptionChange(e.target.value) }}
                                                onBlur={handleBlur}
                                                placeholder="Añade notas sobre este ejercicio..."
                                                className="w-full text-sm text-gray-600 dark:text-gray-400 bg-primary-50/50 dark:bg-gray-950/50 border border-primary-100 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 min-h-[40px]"
                                                rows={1}
                                            />
                                        </div>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsEditing(false) }}
                                            className="w-full bg-primary-500 text-white text-sm font-bold py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                                        >
                                            Guardar Cambios
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-lg font-medium text-primary-950 dark:text-primary-100 leading-tight break-words">
                                            {name}
                                        </h3>
                                    </div>
                                )}
                            </div>

                            {!isEditing && <button
                                onClick={(e) => { e.stopPropagation(); handleRemove() }}
                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-all"
                                title="Eliminar de la clase"
                            >
                                <Trash2 size={16} />
                            </button>}
                        </div>

                        {isExpanded && !isEditing && description && (
                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap border-t border-primary-50 dark:border-gray-800 pt-2 ml-2">
                                {description}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
}