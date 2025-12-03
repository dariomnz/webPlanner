import { useState, useRef, useCallback } from 'react';
import {
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    DragCancelEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { PlannedExercise, DragData, ActiveItem, Exercise, Section } from '../types';
import { createPreviewExercise, finalizePreviewExercise } from '../utils/exerciseHelpers';

interface UseDragAndDropProps {
    plannedExercises: PlannedExercise[];
    setPlannedExercises: (exercises: PlannedExercise[] | ((prev: PlannedExercise[]) => PlannedExercise[])) => void;
    exercises: Exercise[];
    isEditMode: boolean;
    onMoveExerciseToSection: (exerciseId: string, newSection: string) => void;
    sections: Section[];
    onReorderSections: (sections: Section[], group: string) => void;
    onReorderExercises?: (exercises: Exercise[]) => void;
    onDragEndShowMenu?: () => void;
}

export function useDragAndDrop({
    plannedExercises,
    setPlannedExercises,
    exercises,
    sections,
    isEditMode,
    onMoveExerciseToSection,
    onReorderSections,
    onReorderExercises,
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
        } else if (data?.type === 'section') {
            setActiveItem({
                id: data.id!,
                name: data.name!,
                section: data.section!,
                source: 'section'
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

        // Case 0: Dragging a Section
        if (data?.type === 'section') {
            return; // Section sorting is handled by SortableContext visual updates, commit on DragEnd
        }

        // Case 1: Dragging from Menu
        if (data?.type === 'menu-item') {
            if (isEditMode) return; // In edit mode, menu items are sortable, not draggable to planner

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
    }, [plannedExercises, setPlannedExercises, isEditMode]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveItem(null);

        const data = active.data.current as DragData | undefined;

        // Case 0: Section Reordering
        if (data?.type === 'section') {
            const activeId = active.id as string;
            const overId = over?.id as string;

            if (overId && activeId !== overId) {
                const activeSection = sections.find(s => `section-${s.group}-${s.name}` === activeId);
                const overSection = sections.find(s => `section-${s.group}-${s.name}` === overId);

                if (activeSection && overSection && activeSection.group === overSection.group) {
                    const groupSections = sections.filter(s => s.group === activeSection.group);
                    const oldIndex = groupSections.findIndex(s => `section-${s.group}-${s.name}` === activeId);
                    const newIndex = groupSections.findIndex(s => `section-${s.group}-${s.name}` === overId);

                    if (oldIndex !== -1 && newIndex !== -1) {
                        const newGroupSections = arrayMove(groupSections, oldIndex, newIndex);
                        onReorderSections(newGroupSections, activeSection.group);
                    }
                }
            }
            return;
        }

        // Case 1: Menu item dragging
        if (data?.type === 'menu-item') {
            if (isEditMode && over) {
                const activeId = active.id as string;
                const overId = over.id as string;

                // Handle reordering within the menu (same section)
                if (typeof overId === 'string' && overId.startsWith('menu-') && activeId !== overId) {
                    const activeExercise = exercises.find(e => `menu-${e.id}` === activeId);
                    const overExercise = exercises.find(e => `menu-${e.id}` === overId);

                    if (activeExercise && overExercise && activeExercise.section === overExercise.section) {
                        // Check if they're in the same group by looking up their sections
                        const activeSection = sections.find(s => s.name === activeExercise.section);
                        const overSection = sections.find(s => s.name === overExercise.section);

                        if (activeSection && overSection && activeSection.group === overSection.group) {
                            const oldIndex = exercises.findIndex(e => e.id === activeExercise.id);
                            const newIndex = exercises.findIndex(e => e.id === overExercise.id);

                            if (oldIndex !== -1 && newIndex !== -1 && onReorderExercises) {
                                const newExercises = arrayMove(exercises, oldIndex, newIndex);
                                onReorderExercises(newExercises);
                            }
                        }
                    }
                    return;
                }

                // Handle moving to a different section (dropping on section header)
                if (typeof overId === 'string' && overId.startsWith('section-')) {
                    let newSectionName = '';
                    const section = sections.find(s => `section-${s.group}-${s.name}` === overId);
                    if (section) {
                        newSectionName = section.name;
                    }

                    const exerciseId = data.id;
                    if (exerciseId && newSectionName) {
                        onMoveExerciseToSection(exerciseId, newSectionName);
                    }
                    return;
                }
            }

            if (isEditMode) return;

            // Dragging to planner
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

            onDragEndShowMenu?.();
        }
        // Case 2: Reordering within planner
        else {
            const activeId = active.id as string;
            const overId = over?.id as string;

            if (activeId !== overId) {
                setPlannedExercises((items) => {
                    const oldIndex = items.findIndex((item) => item.id === activeId);
                    const newIndex = items.findIndex((item) => item.id === overId);

                    if (oldIndex !== -1 && newIndex !== -1) {
                        return arrayMove(items, oldIndex, newIndex);
                    }
                    return items;
                });
            }
        }
    }, [plannedExercises, setPlannedExercises, exercises, isEditMode, onMoveExerciseToSection, onReorderExercises, onDragEndShowMenu, sections, onReorderSections]);

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
