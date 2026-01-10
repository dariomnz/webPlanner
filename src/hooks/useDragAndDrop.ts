import { useCallback, } from 'react';
import { DropResult, DragStart } from '@hello-pangea/dnd';
import { PlannedExercise, Exercise, Section } from '../types';
import { createPlannedExercise } from '../utils/exerciseHelpers';

interface UseDragAndDropProps {
    setPlannedExercises: (exercises: PlannedExercise[] | ((prev: PlannedExercise[]) => PlannedExercise[])) => void;
    exercises: Exercise[];
    sections: Section[];
    isEditMode: boolean;
    onMoveExerciseToSection: (exerciseId: string, newSection: string) => void;
    onReorderSections: (sections: Section[], group: string) => void;
    onReorderExercises: (exercises: Exercise[]) => void;
    setIsMenuVisible: (state: boolean) => void;
}

function arrayMove<T>(array: T[], from: number, to: number): T[] {
    const newArray = [...array];
    const [item] = newArray.splice(from, 1);
    newArray.splice(to, 0, item);
    return newArray;
}

export function useDragAndDrop({
    setPlannedExercises,
    exercises,
    sections,
    isEditMode,
    onMoveExerciseToSection,
    onReorderSections,
    onReorderExercises,
    setIsMenuVisible,
}: UseDragAndDropProps) {

    const handleDragStart = useCallback((_result: DragStart) => {
        setIsMenuVisible(false);
    }, [setIsMenuVisible]);

    const handleDragEnd = useCallback((result: DropResult) => {
        const { source, destination, draggableId } = result;

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
                    setIsMenuVisible(true);
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
    }, [exercises, isEditMode, onMoveExerciseToSection, onReorderExercises, onReorderSections, sections, setIsMenuVisible, setPlannedExercises]);

    return {
        handleDragStart,
        handleDragEnd,
    };
}
