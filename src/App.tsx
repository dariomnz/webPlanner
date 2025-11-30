import { useState } from 'react';
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
import { Exercise, PlannedExercise, DragData } from './types';

interface ActiveItem extends PlannedExercise {
    source?: 'menu' | 'planner';
}

function App() {
    const [exercises, setExercises] = useState<Exercise[]>([
        { id: '1', name: 'The Hundred' },
        { id: '2', name: 'Roll Up' },
        { id: '3', name: 'Single Leg Circles' },
        { id: '4', name: 'Rolling Like a Ball' },
        { id: '5', name: 'Single Leg Stretch' },
    ]);

    const [plannedExercises, setPlannedExercises] = useState<PlannedExercise[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);

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

    const handleAddExercise = (name: string) => {
        const newExercise: Exercise = {
            id: Date.now().toString(),
            name,
        };
        setExercises([...exercises, newExercise]);
    };

    const handleRemoveExercise = (id: string) => {
        setPlannedExercises(plannedExercises.filter((ex) => ex.id !== id));
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);

        // Determine if we are dragging from menu or planner
        const data = active.data.current as DragData | undefined;
        if (data?.type === 'menu-item') {
            setActiveItem({ id: data.id!, name: data.name!, source: 'menu' });
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
            const previewId = `${activeId}-preview`;
            const isActiveInPlanner = plannedExercises.some(ex => ex.id === previewId);
            const isOverPlanner = over.id === 'planner-droppable' || plannedExercises.some(ex => ex.id === overId);
            if (isOverPlanner) {
                if (!isActiveInPlanner) {
                    // Insert preview
                    const newItem: PlannedExercise = {
                        id: previewId,
                        name: data.name!,
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

        const data = active.data.current as DragData | undefined;
        if (data?.type === 'menu-item') {
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
        setActiveId(null);
        setActiveItem(null);
        const { active } = event;
        const data = active.data.current as DragData | undefined;
        if (data?.type === 'menu-item') {
            const previewId = `${active.id}-preview`;
            setPlannedExercises((items) => items.filter((item) => item.id !== previewId));
        }
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
                    onAddExercise={handleAddExercise}
                    onAddToPlan={handleAddToPlan}
                />
                <ClassPlanner
                    plannedExercises={plannedExercises}
                    onRemoveExercise={handleRemoveExercise}
                />

                <DragOverlay>
                    {activeId && activeItem ? (
                        <div className="p-3 bg-white rounded-lg shadow-xl border border-pink-300 opacity-90 w-64 cursor-grabbing">
                            <span className="font-medium text-gray-800">{activeItem.name}</span>
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}

export default App;
