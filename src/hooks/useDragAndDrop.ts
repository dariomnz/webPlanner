import { useState, useRef, useCallback } from 'react';
import {
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    DragCancelEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { PlannedExercise, DragData, ActiveItem, Exercise } from '../types';
import { createPreviewExercise, finalizePreviewExercise } from '../utils/exerciseHelpers';

interface UseDragAndDropProps {
    plannedExercises: PlannedExercise[];
    setPlannedExercises: (exercises: PlannedExercise[] | ((prev: PlannedExercise[]) => PlannedExercise[])) => void;
    exercises: Exercise[];
    isEditMode: boolean;
    onMoveExerciseToSection: (exerciseId: string, newSection: string) => void;
    onDragEndShowMenu?: () => void; // Optional callback to show menu when drag ends
}

export function useDragAndDrop({
    plannedExercises,
    setPlannedExercises,
    exercises,
    isEditMode,
    onMoveExerciseToSection,
    onDragEndShowMenu,
}: UseDragAndDropProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
    const lastSwapRef = useRef<{ activeId: string; overId: string } | null>(null);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        lastSwapRef.current = null;

        const data = active.data.current as DragData | undefined;
        if (data?.type === 'menu-item') {
            const originalExercise = exercises.find(e => e.id === data.id);
            setActiveItem({
                id: data.id!,
                name: data.name!,
                description: data.description!,
                section: originalExercise?.section || 'Uncategorized',
                source: 'menu'
            });
        } else {
            const item = plannedExercises.find(e => e.id === active.id);
            if (item) setActiveItem({ ...item, source: 'planner' });
        }
    }, [exercises, plannedExercises]);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { active, over } = event;

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

        const data = active.data.current as DragData | undefined;

        // Case 1: Dragging from Menu
        if (data?.type === 'menu-item') {
            if (isEditMode) return;

            const previewId = `${activeId}-preview`;
            const isActiveInPlanner = plannedExercises.some(ex => ex.id === previewId);
            const isOverPlanner = over.id === 'planner-droppable' || plannedExercises.some(ex => ex.id === overId);

            if (isOverPlanner) {
                if (!isActiveInPlanner) {
                    const newItem = createPreviewExercise(
                        activeId,
                        data.name!,
                        data.section!,
                        "irrelevant",
                        data.description
                    );

                    setPlannedExercises((items) => {
                        const overIndex = items.findIndex((item) => item.id === overId);
                        const newIndex = overIndex >= 0 ? overIndex : items.length;
                        const newItems = [...items];
                        newItems.splice(newIndex, 0, newItem);
                        return newItems;
                    });
                } else if (previewId !== overId) {
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
                const isSameSwap = lastSwapRef.current?.activeId === activeId && lastSwapRef.current?.overId === overId;

                if (!isSameSwap) {
                    lastSwapRef.current = { activeId, overId };

                    setPlannedExercises((items) => {
                        const oldIndex = items.findIndex((item) => item.id === activeId);
                        const newIndex = items.findIndex((item) => item.id === overId);

                        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                            const newItems = [...items];
                            [newItems[oldIndex], newItems[newIndex]] = [newItems[newIndex], newItems[oldIndex]];
                            return newItems;
                        }
                        return items;
                    });
                }
            }
        }
    }, [plannedExercises, setPlannedExercises, isEditMode]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveItem(null);

        const data = active.data.current as DragData | undefined;
        if (data?.type === 'menu-item') {
            if (isEditMode && over && typeof over.id === 'string' && over.id.startsWith('section-')) {
                const newSection = over.id.replace('section-', '');
                const exerciseId = data.id;
                if (exerciseId) {
                    onMoveExerciseToSection(exerciseId, newSection);
                }
                return;
            }

            if (isEditMode) return;

            const previewId = `${active.id}-preview`;
            const isOverPlanner = over && (over.id === 'planner-droppable' || plannedExercises.some(e => e.id === over.id));

            if (isOverPlanner) {
                setPlannedExercises((items) => items.map(item => {
                    if (item.id === previewId) {
                        return finalizePreviewExercise(item);
                    }
                    return item;
                }));
            } else {
                setPlannedExercises((items) => items.filter((item) => item.id !== previewId));
            }

            // Only show menu when dragging FROM menu (not when reordering within planner)
            onDragEndShowMenu?.();
        }
    }, [plannedExercises, setPlannedExercises, isEditMode, onMoveExerciseToSection, onDragEndShowMenu]);

    const handleDragCancel = useCallback((event: DragCancelEvent) => {
        const { active } = event;
        setActiveId(null);
        setActiveItem(null);

        const data = active.data.current as DragData | undefined;
        if (data?.type === 'menu-item') {
            const previewId = `${active.id}-preview`;
            setPlannedExercises((items) => items.filter((item) => item.id !== previewId));
        }
    }, [setPlannedExercises]);

    return {
        activeId,
        activeItem,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragCancel,
    };
}
