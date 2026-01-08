import { useState, useCallback, useRef, useEffect } from 'react';
import { DropResult, DragStart } from '@hello-pangea/dnd';
import { PlannedExercise, Exercise, Section, ActiveItem } from '../types';
import { createPlannedExercise } from '../utils/exerciseHelpers';

interface UseDragAndDropProps {
    plannedExercises: PlannedExercise[];
    setPlannedExercises: (exercises: PlannedExercise[] | ((prev: PlannedExercise[]) => PlannedExercise[])) => void;
    exercises: Exercise[];
    sections: Section[];
    isEditMode: boolean;
    onMoveExerciseToSection: (exerciseId: string, newSection: string) => void;
    onReorderSections: (sections: Section[], group: string) => void;
    onReorderExercises?: (exercises: Exercise[]) => void;
    onDragEndShowMenu?: () => void;
    onActiveChange?: (id: string | null, source?: 'menu' | 'planner' | 'section') => void;
}

function arrayMove<T>(array: T[], from: number, to: number): T[] {
    const newArray = [...array];
    const [item] = newArray.splice(from, 1);
    newArray.splice(to, 0, item);
    return newArray;
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
    onActiveChange,
}: UseDragAndDropProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);

    const stateRef = useRef({
        plannedExercises,
        setPlannedExercises,
        exercises,
        sections,
        isEditMode,
        onReorderExercises,
        onReorderSections,
        onMoveExerciseToSection,
        onDragEndShowMenu,
        onActiveChange,
    });

    useEffect(() => {
        stateRef.current = {
            plannedExercises,
            setPlannedExercises,
            exercises,
            sections,
            isEditMode,
            onReorderExercises,
            onReorderSections,
            onMoveExerciseToSection,
            onDragEndShowMenu,
            onActiveChange,
        };
    });

    const handleDragStart = useCallback((start: DragStart) => {
        const { draggableId } = start;
        const { exercises, plannedExercises, onActiveChange } = stateRef.current;

        setActiveId(draggableId);

        let source: 'menu' | 'planner' | 'section' | undefined;

        if (draggableId.startsWith('menu-')) {
            source = 'menu';
            const id = draggableId.replace('menu-', '');
            const exercise = exercises.find(e => e.id === id);
            if (exercise) {
                setActiveItem({ ...exercise, source: 'menu' });
            }
        } else if (draggableId.startsWith('section-')) {
            source = 'section';
            const idParts = draggableId.split('-');
            const name = idParts[idParts.length - 1];
            const group = idParts.slice(1, -1).join('-');
            setActiveItem({
                id: draggableId,
                name: name,
                section: name,
                group: group,
                source: 'section'
            });
        } else {
            source = 'planner';
            const exercise = plannedExercises.find(e => e.id === draggableId);
            if (exercise) {
                setActiveItem({ ...exercise, source: 'planner' });
            }
        }

        onActiveChange?.(draggableId, source);
    }, []);

    const handleDragEnd = useCallback((result: DropResult) => {
        const { source, destination, draggableId } = result;
        const {
            exercises,
            sections,
            isEditMode,
            onReorderExercises,
            onReorderSections,
            onMoveExerciseToSection,
            setPlannedExercises,
            onDragEndShowMenu,
            onActiveChange
        } = stateRef.current;

        // Reset state
        setActiveId(null);
        setActiveItem(null);
        onActiveChange?.(null);

        if (!destination) {
            return;
        }

        // Case 1: Reordering within planner
        if (source.droppableId === 'planner-droppable' && destination.droppableId === 'planner-droppable') {
            setPlannedExercises((prev) => arrayMove(prev, source.index, destination.index));
        }
        // Case 2: Dragging from menu to planner
        else if (source.droppableId.startsWith('droppable-section-') && destination.droppableId === 'planner-droppable') {
            const id = draggableId.replace('menu-', '');
            const exercise = exercises.find(e => e.id === id);

            if (exercise) {
                const newItem = createPlannedExercise(exercise);

                setPlannedExercises((prev) => {
                    const next = [...prev];
                    next.splice(destination.index, 0, newItem);
                    return next;
                });

                setTimeout(() => {
                    onDragEndShowMenu?.();
                }, 50);
            }
        }
        // Case 3: Reordering sections in menu
        else if (source.droppableId === 'section-list' && destination.droppableId === 'section-list') {
            const group = sections.find(s => `section-${s.group}-${s.name}` === draggableId)?.group;
            if (group) {
                const groupSections = sections.filter(s => s.group === group);
                const newGroupSections = arrayMove(groupSections, source.index, destination.index);
                onReorderSections(newGroupSections, group);
            }
        }
        // Case 4: Reordering exercises within a section
        else if (source.droppableId.startsWith('droppable-section-') && destination.droppableId === source.droppableId && isEditMode) {
            const id = draggableId.replace('menu-', '');
            const exercise = exercises.find(e => e.id === id);
            if (exercise && onReorderExercises) {
                const sectionExercises = exercises.filter(e => `droppable-section-${e.group}-${e.section}` === source.droppableId);
                const movedExercise = sectionExercises[source.index];
                const targetExercise = sectionExercises[destination.index];

                const globalFromIndex = exercises.findIndex(e => e.id === movedExercise.id);
                const globalToIndex = exercises.findIndex(e => e.id === targetExercise.id);

                onReorderExercises(arrayMove(exercises, globalFromIndex, globalToIndex));
            }
        }
        // Case 5: Moving exercise to a different section
        else if (source.droppableId.startsWith('droppable-section-') && destination.droppableId.startsWith('droppable-section-') && isEditMode) {
            const id = draggableId.replace('menu-', '');
            const targetSection = sections.find(s => `droppable-section-${s.group}-${s.name}` === destination.droppableId);
            if (targetSection) {
                onMoveExerciseToSection(id, targetSection.name);
            }
        }
    }, []);

    return {
        activeId,
        activeItem,
        handleDragEnd,
        handleDragStart
    };
}
