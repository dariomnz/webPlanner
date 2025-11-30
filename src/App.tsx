import { useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import {
    DndContext,
    DragOverlay,
    rectIntersection,
    KeyboardSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    DragCancelEvent,
    MouseSensor,
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import ExerciseMenu from './components/ExerciseMenu.tsx';
import ClassPlanner from './components/ClassPlanner.tsx';
import ConfirmationModal from './components/ConfirmationModal.tsx';
import { Exercise, PlannedExercise, DragData } from './types';
import { X, Menu } from 'lucide-react';

interface ActiveItem extends PlannedExercise {
    source?: 'menu' | 'planner';
}

function App() {
    const [exercises, setExercises] = useLocalStorage<Exercise[]>('exercises', [
        { id: '1', name: 'The Hundred', section: 'Core' },
        { id: '2', name: 'Roll Up', section: 'Core' },
        { id: '3', name: 'Single Leg Circles', section: 'Legs' },
        { id: '4', name: 'Rolling Like a Ball', section: 'Core' },
        { id: '5', name: 'Single Leg Stretch', section: 'Legs' },
    ]);

    const [sections, setSections] = useLocalStorage<string[]>('sections', ['Core', 'Legs', 'Arms', 'Back']);

    const [plannedExercises, setPlannedExercises] = useLocalStorage<PlannedExercise[]>('planned-exercises', []);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
    const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);
    const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            // Require the mouse to move by 10 pixels before activating
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            // Press delay of 250ms, with tolerance of 5px of movement
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleAddExercise = (name: string, section: string) => {
        const newExercise: Exercise = {
            id: Date.now().toString(),
            name,
            section,
        };
        setExercises([...exercises, newExercise]);
    };

    const handleAddSection = (section: string) => {
        if (!sections.includes(section)) {
            setSections([...sections, section]);
        }
    };

    const handleRemoveExercise = (id: string) => {
        setPlannedExercises(plannedExercises.filter((ex) => ex.id !== id));
    };

    const handleDeleteExerciseFromMenu = (id: string) => {
        setExerciseToDelete(id);
    };

    const confirmDeleteExercise = () => {
        if (exerciseToDelete) {
            setExercises(exercises.filter(ex => ex.id !== exerciseToDelete));
            setExerciseToDelete(null);
        }
    };

    const handleDeleteSection = (section: string) => {
        setSectionToDelete(section);
    };

    const handleMoveExerciseToSection = (exerciseId: string, newSection: string) => {
        setExercises(exercises.map(ex =>
            ex.id === exerciseId ? { ...ex, section: newSection } : ex
        ));
    };

    const confirmDeleteSection = () => {
        if (sectionToDelete) {
            setSections(sections.filter(s => s !== sectionToDelete));
            // Optional: Move exercises from deleted section to 'Uncategorized' or keep them as is (they will show in Uncategorized automatically)
            setSectionToDelete(null);
        }
    };

    const toggleMenu = () => {
        setIsMenuVisible(!isMenuVisible);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);

        // Hide menu on mobile when dragging starts
        if (window.innerWidth < 768) {
            setIsMenuVisible(false);
        }

        // Determine if we are dragging from menu or planner
        const data = active.data.current as DragData | undefined;
        if (data?.type === 'menu-item') {
            // Find the original exercise to get the section
            const originalExercise = exercises.find(e => e.id === data.id);
            setActiveItem({
                id: data.id!,
                name: data.name!,
                section: originalExercise?.section || 'Uncategorized',
                source: 'menu'
            });
        } else {
            // Find item in planner
            const item = plannedExercises.find(e => e.id === active.id);
            if (item) setActiveItem({ ...item, source: 'planner' });
        }
    };

    const handleAddToPlan = (exercise: Exercise) => {
        const newItem: PlannedExercise = {
            id: `planned-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: exercise.name,
            section: exercise.section,
        };
        setPlannedExercises([...plannedExercises, newItem]);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        // If dropped outside any droppable area, remove the preview if it exists
        if (!over) {
            const data = active.data.current as DragData | undefined;
            if (data?.type === 'menu-item') {
                const previewId = `${active.id}-preview`;
                setPlannedExercises((items) => items.filter((item) => item.id !== previewId));
            }
            return;
        }

        const activeId = active.id as string;
        const overId = over.id as string;

        // Case 1: Dragging from Menu
        const data = active.data.current as DragData | undefined;
        if (data?.type === 'menu-item') {
            // In edit mode, check if dragging over a section
            if (isEditMode && typeof overId === 'string' && overId.startsWith('section-')) {
                // Don't do anything here, handle in onDragEnd
                return;
            }

            const previewId = `${activeId}-preview`;
            const isActiveInPlanner = plannedExercises.some(ex => ex.id === previewId);
            const isOverPlanner = over.id === 'planner-droppable' || plannedExercises.some(ex => ex.id === overId);
            if (isOverPlanner) {
                if (!isActiveInPlanner) {
                    // Insert preview
                    const newItem: PlannedExercise = {
                        id: previewId,
                        name: data.name!,
                        section: data.section!,
                        isPreview: true, // Mark as preview
                    };

                    setPlannedExercises((items) => {
                        const overIndex = items.findIndex((item) => item.id === overId);
                        const newIndex = overIndex >= 0 ? overIndex : items.length;
                        const newItems = [...items];
                        newItems.splice(newIndex, 0, newItem);
                        return newItems;
                    });
                } else if (previewId !== overId) {
                    // Reorder preview item
                    setPlannedExercises((items) => {
                        const oldIndex = items.findIndex((item) => item.id === previewId);
                        const newIndex = items.findIndex((item) => item.id === overId);
                        if (oldIndex !== -1 && newIndex !== -1) {
                            return arrayMove(items, oldIndex, newIndex);
                        }
                        return items;
                    });
                }
            } else {
                // Dragged out of planner - remove preview
                if (isActiveInPlanner) {
                    setPlannedExercises((items) => items.filter((item) => item.id !== previewId));
                }
            }
        }
        // Case 2: Reordering within Planner
        else {
            const isActiveInPlanner = plannedExercises.some(ex => ex.id === activeId);
            const isOverPlanner = over.id === 'planner-droppable' || plannedExercises.some(ex => ex.id === overId);

            if (isActiveInPlanner && isOverPlanner && activeId !== overId) {
                setPlannedExercises((items) => {
                    const oldIndex = items.findIndex((item) => item.id === activeId);
                    const newIndex = items.findIndex((item) => item.id === overId);
                    return arrayMove(items, oldIndex, newIndex);
                });
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveItem(null);

        // Show menu again on mobile when dragging ends
        if (window.innerWidth < 768 && active.data.current?.type === 'menu-item') {
            setIsMenuVisible(true);
        }

        const data = active.data.current as DragData | undefined;
        if (data?.type === 'menu-item') {
            // Check if in edit mode and dropped on a section
            if (isEditMode && over && typeof over.id === 'string' && over.id.startsWith('section-')) {
                const newSection = over.id.replace('section-', '');
                const exerciseId = data.id;
                if (exerciseId) {
                    handleMoveExerciseToSection(exerciseId, newSection);
                }
                return;
            }

            const previewId = `${active.id}-preview`;
            const isOverPlanner = over && (over.id === 'planner-droppable' || plannedExercises.some(e => e.id === over.id));
            if (isOverPlanner) {
                // Finalize the drop: rename ID and remove isPreview flag
                setPlannedExercises((items) => items.map(item => {
                    if (item.id === previewId) {
                        const { isPreview, ...rest } = item;
                        return { ...rest, id: `planned-${Date.now()}-${Math.floor(Math.random() * 1000)}` };
                    }
                    return item;
                }));
            } else {
                // Dropped outside: remove preview
                setPlannedExercises((items) => items.filter((item) => item.id !== previewId));
            }
        }
    };

    const handleDragCancel = (event: DragCancelEvent) => {
        const { active } = event;
        setActiveId(null);
        setActiveItem(null);

        // Show menu again on mobile when dragging is cancelled
        if (window.innerWidth < 768 && active.data.current?.type === 'menu-item') {
            setIsMenuVisible(true);
        }

        const data = active.data.current as DragData | undefined;
        if (data?.type === 'menu-item') {
            const previewId = `${active.id}-preview`;
            setPlannedExercises((items) => items.filter((item) => item.id !== previewId));
        }
    };

    const handleClearAll = () => {
        setIsClearModalOpen(true);
    };

    const confirmClearAll = () => {
        setPlannedExercises([]);
        setIsClearModalOpen(false);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="flex h-screen bg-beige-50 font-sans text-gray-900">
                <ExerciseMenu
                    exercises={exercises}
                    sections={sections}
                    onAddExercise={handleAddExercise}
                    onAddSection={handleAddSection}
                    onAddToPlan={handleAddToPlan}
                    onDeleteExercise={handleDeleteExerciseFromMenu}
                    onDeleteSection={handleDeleteSection}
                    onMoveExerciseToSection={handleMoveExerciseToSection}
                    isEditMode={isEditMode}
                    onEditModeChange={setIsEditMode}
                    isVisible={isMenuVisible}
                />
                <ClassPlanner
                    plannedExercises={plannedExercises}
                    onRemoveExercise={handleRemoveExercise}
                    onClearAll={handleClearAll}
                />

                {/* Mobile menu toggle button */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden fixed bottom-6 left-6 z-50 p-4 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition-all active:scale-95"
                    aria-label={isMenuVisible ? "Ocultar menú" : "Mostrar menú"}
                >
                    {isMenuVisible ? (
                        <X></X>
                    ) : (
                        <Menu></Menu>
                    )}
                </button>

                <DragOverlay>
                    {activeId && activeItem ? (
                        <div className="p-3 bg-white rounded-lg shadow-xl border border-pink-300 opacity-90 w-64 cursor-grabbing">
                            <span className="font-medium text-gray-800">{activeItem.name}</span>
                        </div>
                    ) : null}
                </DragOverlay>

                <ConfirmationModal
                    isOpen={isClearModalOpen}
                    onClose={() => setIsClearModalOpen(false)}
                    onConfirm={confirmClearAll}
                    title="¿Borrar toda la clase?"
                    message="¿Estás seguro de que quieres eliminar todos los ejercicios de la planificación? Esta acción no se puede deshacer y perderás el progreso actual."
                />

                <ConfirmationModal
                    isOpen={!!exerciseToDelete}
                    onClose={() => setExerciseToDelete(null)}
                    onConfirm={confirmDeleteExercise}
                    title="¿Eliminar ejercicio?"
                    message="¿Estás seguro de que quieres eliminar este ejercicio de la biblioteca? Se mantendrá en las clases ya planificadas pero no podrás volver a añadirlo."
                />

                <ConfirmationModal
                    isOpen={!!sectionToDelete}
                    onClose={() => setSectionToDelete(null)}
                    onConfirm={confirmDeleteSection}
                    title="¿Eliminar sección?"
                    message={`¿Estás seguro de que quieres eliminar la sección "${sectionToDelete}"? Los ejercicios de esta sección no se borrarán, pasarán a estar "Sin Categoría".`}
                />
            </div>
        </DndContext>
    );
}

export default App;
