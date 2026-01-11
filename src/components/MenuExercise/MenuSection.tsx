import { useState, useCallback, useMemo } from 'react';
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

    const handleDeleteSection = useCallback((section: Section) => {
        setSectionToDelete(section);
    }, [setSectionToDelete]);

    const confirmDeleteSection = useCallback(() => {
        if (sectionToDelete) {
            dataStore.removeSection(sectionToDelete.name, sectionToDelete.group);
            setSectionToDelete(null);
        }
    }, [sectionToDelete, setSectionToDelete]);
    const handleCloseDeleteSectionModal = useCallback(() => setSectionToDelete(null), [setSectionToDelete]);


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
                        className={`mb-4 ${snapshot.isDragging ? 'z-50' : ''}`}
                    >
                        <div
                            {...provided.dragHandleProps}
                            className={`flex items-center justify-between p-1 cursor-pointer group rounded-lg bg-pink-50/50 hover:bg-pink-100 ${snapshot.isDragging ? 'bg-pink-100' : 'transition-colors'}`}
                            onClick={() => setIsOpen(!isOpen)}
                            onDoubleClick={handleSectionDoubleClick}
                        >
                            <div className={`flex flex-col text-pink-900 font-semibold w-full ${isRenamingSection ? 'p-2' : ''}`}>
                                <div className="flex items-center">
                                    {!isRenamingSection && (
                                        <>
                                            {isOpen ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                                            <span>{title}</span>
                                            <span className="ml-2 text-xs text-pink-400 font-normal bg-white px-2 py-0.5 rounded-full border border-pink-100">
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
                                                className="w-full px-3 py-2 text-sm bg-white border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                                                autoFocus
                                                rows={1}
                                            />
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSectionRenameSubmit();
                                            }}
                                            className="w-full bg-pink-500 text-white text-sm font-bold py-2 rounded-lg hover:bg-pink-600 transition-colors shadow-sm"
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
                                        className="p-1 text-pink-400 hover:text-pink-600 hover:bg-white rounded transition-all"
                                        title="Añadir ejercicio"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSection({ name: title, group: currentGroup });
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-white rounded transition-all ml-1"
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
                                        className={`pl-2 border-l-2 border-pink-100 ml-2 mt-2 min-h-[5px] transition-colors ${exerciseSnapshot.isDraggingOver ? 'bg-pink-50/30' : ''}`}
                                    >
                                        {isAdding && (
                                            <form onSubmit={handleSubmit} className="mb-2 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newExercise}
                                                    onChange={(e) => setNewExercise(e.target.value)}
                                                    placeholder="Nombre del ejercicio..."
                                                    className="flex-1 min-w-0 px-2 py-1 text-sm rounded border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-400"
                                                    onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                                                    autoFocus
                                                />
                                                <button
                                                    type="submit"
                                                    className="p-1 bg-pink-500 text-white rounded hover:bg-pink-600"
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
