import { useState, useCallback, useMemo, useEffect, useEffectEvent, useRef } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2 } from '../Common/Icons';
import { Section } from '../../types/exercise';
import MenuExerciseItem from './MenuExerciseItem';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { AutoResizeTextarea } from '../Common/AutoResizeTextarea';
import { dataStore } from '../../store/DataStore';
import { createExercise } from '../../utils/exerciseHelpers';
import ConfirmationModal from '../Common/ConfirmationModal';
import { useStoreItem } from '../../hooks/useDataStore';

interface SectionProps {
    index: number;
    currentGroup: string;
    title: string;
    isEditMode: boolean;
}

export default function MenuSection({
    index,
    currentGroup,
    title,
    isEditMode,
}: SectionProps) {
    const exercises = useStoreItem('exercises', () => dataStore.getExercises());
    const filteredExercises = useMemo(
        () => exercises.filter(e => e.section === title && e.group === currentGroup),
        [exercises, title, currentGroup]
    );

    const [isOpen, setIsOpen] = useState(true);
    const [newExercise, setNewExercise] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isRenamingSection, setIsRenamingSection] = useState(false);
    const [newSectionName, setNewSectionName] = useState(title);

    const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const isDeletingRef = useRef(false);

    const [isNew, setIsNew] = useState(true);
    const setIsNewEvent = useEffectEvent(setIsNew);
    useEffect(() => {
        const timer = setTimeout(() => setIsNewEvent(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleDeleteSection = useCallback((section: Section) => {
        setSectionToDelete(section);
    }, [setSectionToDelete]);

    const confirmDeleteSection = useCallback(() => {
        isDeletingRef.current = true;
        setIsDeleting(true);
    }, []);

    const onAnimationEnd = useCallback(() => {
        if (isDeletingRef.current && sectionToDelete) {
            dataStore.removeSection(sectionToDelete.name, sectionToDelete.group);
            setSectionToDelete(null);
            setIsDeleting(false);
            isDeletingRef.current = false;
        }
    }, [sectionToDelete, setSectionToDelete]);

    const handleCloseDeleteSectionModal = useCallback(() => {
        if (!isDeletingRef.current) {
            setSectionToDelete(null);
        }
    }, [setSectionToDelete]);


    const sectionId = `section-${currentGroup}-${title}`;

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (newExercise.trim()) {
            const exercise = createExercise(newExercise.trim(), title, currentGroup);
            dataStore.addExercise(exercise);
            setNewExercise('');
            setIsAdding(false);
        }
    }, [newExercise, title, currentGroup]);

    const handleSectionDoubleClick = useCallback((e: React.MouseEvent) => {
        if (isEditMode) {
            e.stopPropagation();
            setIsRenamingSection(true);
        }
    }, [isEditMode, setIsRenamingSection]);

    const handleSectionRenameSubmit = useCallback(() => {
        if (newSectionName.trim() && newSectionName !== title) {
            dataStore.updateSection(title, newSectionName.trim(), currentGroup);
        }
        setIsRenamingSection(false);
    }, [newSectionName, title, currentGroup, setIsRenamingSection]);


    return (
        <>
            <Draggable draggableId={sectionId} index={index} isDragDisabled={!isEditMode || isRenamingSection}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        onAnimationEnd={onAnimationEnd}
                        className={`mb-4 ${snapshot.isDragging ? 'z-50' : ''} ${isNew ? 'animate-zoom-in' : ''} ${isDeleting ? 'animate-zoom-out' : ''}`}
                    >
                        <div
                            {...provided.dragHandleProps}
                            className={`flex items-center justify-between p-1 cursor-pointer group rounded-lg bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-100 dark:hover:bg-primary-900/20 ${snapshot.isDragging ? 'bg-primary-100 dark:bg-primary-900/30' : 'transition-colors transition-shadow duration-200'}`}
                            onClick={() => setIsOpen(!isOpen)}
                            onDoubleClick={handleSectionDoubleClick}
                        >
                            <div className={`flex flex-col text-primary-900 font-semibold w-full ${isRenamingSection ? 'p-2' : ''}`}>
                                <div className="flex items-center">
                                    {!isRenamingSection && (
                                        <>
                                            {isOpen ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                                            <span className="text-primary-600">{title}</span>
                                            <span className="ml-2 text-xs text-primary-400 dark:text-primary-300 font-normal bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-primary-100 dark:border-primary-900/30">
                                                {filteredExercises.length}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {isRenamingSection && (
                                    <div className="mt-2 space-y-3 w-full" onClick={(e) => e.stopPropagation()}>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nombre de la sección</label>
                                            <AutoResizeTextarea
                                                value={newSectionName}
                                                onChange={(e) => setNewSectionName(e.target.value)}
                                                onBlur={handleSectionRenameSubmit}
                                                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-primary-100 dark:border-primary-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/50 text-gray-900 dark:text-gray-100"
                                                autoFocus
                                                rows={1}
                                            />
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSectionRenameSubmit();
                                            }}
                                            className="w-full bg-primary-500 text-white text-sm font-bold py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                                        >
                                            Guardar Cambios
                                        </button>
                                    </div>
                                )}
                            </div>
                            {isEditMode && !isRenamingSection && (
                                <div className="flex items-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsAdding(!isAdding);
                                            setIsOpen(true);
                                        }}
                                        className="p-1 text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-white dark:hover:bg-gray-800 rounded transition-all"
                                        title="Añadir ejercicio"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSection({ name: title, group: currentGroup });
                                        }}
                                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-800 rounded transition-all ml-1"
                                        title="Eliminar sección"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {isOpen && (
                            <Droppable droppableId={`droppable-section-${currentGroup}-${title}`} type="EXERCISE" isDropDisabled={!isEditMode}>
                                {(exerciseProvided, exerciseSnapshot) => (
                                    <div
                                        ref={exerciseProvided.innerRef}
                                        {...exerciseProvided.droppableProps}
                                        className={`pl-2 border-l-2 border-primary-100 dark:border-primary-900/30 ml-2 mt-2 min-h-[5px] transition-colors ${exerciseSnapshot.isDraggingOver ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                                    >
                                        {isAdding && (
                                            <form onSubmit={handleSubmit} className="mb-2 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newExercise}
                                                    onChange={(e) => setNewExercise(e.target.value)}
                                                    placeholder="Nombre del ejercicio..."
                                                    className="flex-1 min-w-0 px-2 py-1 text-sm rounded border border-primary-200 dark:border-primary-900/50 bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-400 dark:focus:ring-primary-600 dark:text-gray-100"
                                                    onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                                                    autoFocus
                                                />
                                                <button
                                                    type="submit"
                                                    className="p-1 bg-primary-500 text-white rounded hover:bg-primary-600"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </form>
                                        )}

                                        {filteredExercises.map((ex, exIndex) => (
                                            <MenuExerciseItem
                                                key={ex.id}
                                                index={exIndex}
                                                exerciseId={ex.id}
                                                isEditMode={isEditMode}
                                            />
                                        ))}
                                        {exerciseProvided.placeholder}
                                        {filteredExercises.length === 0 && !isAdding && (
                                            <div className="text-xs text-gray-400 italic py-1">No hay ejercicios</div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        )}
                    </div>
                )}
            </Draggable>

            <ConfirmationModal
                isOpen={!!sectionToDelete}
                onClose={handleCloseDeleteSectionModal}
                onConfirm={confirmDeleteSection}
                title="¿Eliminar sección?"
                message={`¿Estás seguro de que quieres eliminar la sección "${sectionToDelete?.name}"? SE BORRARÁN TODOS LOS EJERCICIOS de esta sección.`}
            />
        </>
    );
}
