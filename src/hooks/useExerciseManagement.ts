import { useCallback } from 'react';
import { Exercise, PlannedExercise } from '../types';
import { createExercise, createPlannedExercise } from '../utils/exerciseHelpers';

interface UseExerciseManagementProps {
    exercises: Exercise[];
    setExercises: (exercises: Exercise[] | ((prev: Exercise[]) => Exercise[])) => void;
    sections: string[];
    setSections: (sections: string[] | ((prev: string[]) => string[])) => void;
    plannedExercises: PlannedExercise[];
    setPlannedExercises: (exercises: PlannedExercise[] | ((prev: PlannedExercise[]) => PlannedExercise[])) => void;
    isEditMode: boolean;
}

export function useExerciseManagement({
    exercises,
    setExercises,
    sections,
    setSections,
    plannedExercises,
    setPlannedExercises,
    isEditMode,
}: UseExerciseManagementProps) {

    const handleAddExercise = useCallback((name: string, section: string) => {
        const newExercise = createExercise(name, section);
        setExercises([...exercises, newExercise]);
    }, [exercises, setExercises]);

    const handleAddSection = useCallback((section: string) => {
        if (!sections.includes(section)) {
            setSections([...sections, section]);
        }
    }, [sections, setSections]);

    const handleRemoveExercise = useCallback((id: string) => {
        setPlannedExercises(plannedExercises.filter((ex) => ex.id !== id));
    }, [plannedExercises, setPlannedExercises]);

    const handleDeleteExerciseFromMenu = useCallback((id: string) => {
        setExercises(exercises.filter(ex => ex.id !== id));
    }, [exercises, setExercises]);

    const handleDeleteSection = useCallback((section: string) => {
        setSections(sections.filter(s => s !== section));
    }, [sections, setSections]);

    const handleMoveExerciseToSection = useCallback((exerciseId: string, newSection: string) => {
        setExercises(exercises.map(ex =>
            ex.id === exerciseId ? { ...ex, section: newSection } : ex
        ));
    }, [exercises, setExercises]);

    const handleRenameExercise = useCallback((exerciseId: string, newName: string) => {
        setExercises(exercises.map(ex =>
            ex.id === exerciseId ? { ...ex, name: newName } : ex
        ));
    }, [exercises, setExercises]);

    const handleUpdateExercise = useCallback((exerciseId: string, updates: Partial<Exercise>) => {
        setExercises(exercises.map(ex =>
            ex.id === exerciseId ? { ...ex, ...updates } : ex
        ));
    }, [exercises, setExercises]);

    const handleRenameSection = useCallback((oldName: string, newName: string) => {
        setSections(sections.map(s => s === oldName ? newName : s));
        setExercises(exercises.map(ex =>
            ex.section === oldName ? { ...ex, section: newName } : ex
        ));
    }, [sections, setSections, exercises, setExercises]);

    const handleAddToPlan = useCallback((exercise: Exercise) => {
        if (isEditMode) return;

        const newItem = createPlannedExercise(exercise);
        setPlannedExercises([...plannedExercises, newItem]);
    }, [isEditMode, plannedExercises, setPlannedExercises]);

    const handleClearAll = useCallback(() => {
        setPlannedExercises([]);
    }, [setPlannedExercises]);

    return {
        handleAddExercise,
        handleAddSection,
        handleRemoveExercise,
        handleDeleteExerciseFromMenu,
        handleDeleteSection,
        handleMoveExerciseToSection,
        handleRenameExercise,
        handleUpdateExercise,
        handleRenameSection,
        handleAddToPlan,
        handleClearAll,
    };
}
