import { useCallback, } from 'react';
import { DropResult, DragStart } from '@hello-pangea/dnd';
import { dataStore } from '../store/DataStore';
import { createPlannedExercise } from '../utils/exerciseHelpers';

interface UseDragAndDropProps {
    isEditMode: boolean;
    setIsMenuVisible: (state: boolean) => void;
}

function arrayMove<T>(array: T[], from: number, to: number): T[] {
    const newArray = [...array];
    const [item] = newArray.splice(from, 1);
    newArray.splice(to, 0, item);
    return newArray;
}


function onMoveExerciseToSection(exerciseId: string, newSection: string, index: number) {
    const allExercises = [...dataStore.getExercises()];
    const exerciseIdx = allExercises.findIndex(e => e.id === exerciseId);
    if (exerciseIdx === -1) return;

    const [exercise] = allExercises.splice(exerciseIdx, 1);
    const updatedExercise = { ...exercise, section: newSection };

    const targetSectionExercises = allExercises.filter(e =>
        e.section === newSection && (e.group || 'General') === (updatedExercise.group || 'General')
    );

    let targetGlobalIndex: number;
    if (targetSectionExercises.length > 0) {
        if (index < targetSectionExercises.length) {
            const targetRef = targetSectionExercises[index];
            targetGlobalIndex = allExercises.findIndex(e => e.id === targetRef.id);
        } else {
            const lastInSection = targetSectionExercises[targetSectionExercises.length - 1];
            targetGlobalIndex = allExercises.findIndex(e => e.id === lastInSection.id) + 1;
        }
    } else {
        targetGlobalIndex = allExercises.length;
    }

    allExercises.splice(targetGlobalIndex, 0, updatedExercise);

    dataStore.setExercises(allExercises);
}

export function useDragAndDrop({
    isEditMode,
    setIsMenuVisible,
}: UseDragAndDropProps) {
    const handleDragStart = useCallback((_result: DragStart) => {
        if (isEditMode) return;
        setIsMenuVisible(false);
    }, [isEditMode, setIsMenuVisible]);

    const handleDragEnd = useCallback((result: DropResult) => {
        // console.log(result);
        const { source, destination, draggableId } = result;

        if (!destination) {
            return;
        }

        // Case 1: Reordering within planner
        if (source.droppableId === 'planner-droppable' && destination.droppableId === 'planner-droppable') {
            dataStore.setPlannedExercises((prev) => arrayMove(prev, source.index, destination.index));
        }
        // Case 2: Dragging from menu to planner
        else if (source.droppableId.startsWith('droppable-section-') && destination.droppableId === 'planner-droppable') {
            const id = draggableId.replace('menu-', '');
            const exercise = dataStore.getExercises().find(e => e.id === id);

            if (exercise) {
                const newItem = createPlannedExercise(exercise);

                dataStore.setPlannedExercises((prev) => {
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
            const group = dataStore.getSections().find(s => `section-${s.group}-${s.name}` === draggableId)?.group;
            if (group) {
                const groupSections = dataStore.getSections().filter(s => s.group === group);
                const newGroupSections = arrayMove(groupSections, source.index, destination.index);

                const otherSections = dataStore.getSections().filter(s => s.group !== group);
                dataStore.setSections([...otherSections, ...newGroupSections]);
            }
        }
        // Case 4: Reordering exercises within a section
        else if (source.droppableId.startsWith('droppable-section-') && destination.droppableId === source.droppableId && isEditMode) {
            const id = draggableId.replace('menu-', '');
            const exercise = dataStore.getExercises().find(e => e.id === id);
            if (exercise) {
                const sectionExercises = dataStore.getExercises().filter(e => `droppable-section-${e.group}-${e.section}` === source.droppableId);
                const movedExercise = sectionExercises[source.index];
                const targetExercise = sectionExercises[destination.index];

                const globalFromIndex = dataStore.getExercises().findIndex(e => e.id === movedExercise.id);
                const globalToIndex = dataStore.getExercises().findIndex(e => e.id === targetExercise.id);
                console.log(globalFromIndex, globalToIndex);
                dataStore.setExercises(prev => arrayMove(prev, globalFromIndex, globalToIndex));
            }
        }
        // Case 5: Moving exercise to a different section
        else if (source.droppableId.startsWith('droppable-section-') && destination.droppableId.startsWith('droppable-section-') && isEditMode) {
            const id = draggableId.replace('menu-', '');
            const targetSection = dataStore.getSections().find(s => `droppable-section-${s.group}-${s.name}` === destination.droppableId);
            if (targetSection) {
                onMoveExerciseToSection(id, targetSection.name, destination.index);
            }
        }
    }, [isEditMode, setIsMenuVisible]);

    return {
        handleDragStart,
        handleDragEnd,
    };
}
