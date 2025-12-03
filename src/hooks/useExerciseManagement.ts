import { useCallback } from 'react';
import { Exercise, PlannedExercise, Section } from '../types';
import { createExercise, createPlannedExercise } from '../utils/exerciseHelpers';

interface UseExerciseManagementProps {
    exercises: Exercise[];
    setExercises: (exercises: Exercise[] | ((prev: Exercise[]) => Exercise[])) => void;
    sections: Section[];
    setSections: (sections: Section[] | ((prev: Section[]) => Section[])) => void;
    groups: string[];
    setGroups: (groups: string[] | ((prev: string[]) => string[])) => void;
    plannedExercises: PlannedExercise[];
    setPlannedExercises: (exercises: PlannedExercise[] | ((prev: PlannedExercise[]) => PlannedExercise[])) => void;
    isEditMode: boolean;
}

export function useExerciseManagement({
    setExercises,
    setSections,
    setGroups,
    setPlannedExercises,
    isEditMode,
}: UseExerciseManagementProps) {

    const handleAddExercise = useCallback((name: string, section: string, group: string) => {
        const newExercise = createExercise(name, section, group);
        setExercises(prev => [...prev, newExercise]);
    }, [setExercises]);

    const handleAddSection = useCallback((sectionName: string, group: string) => {
        setSections(prev => {
            if (!prev.some(s => s.name === sectionName && s.group === group)) {
                return [...prev, { name: sectionName, group }];
            }
            return prev;
        });
    }, [setSections]);

    const handleAddGroup = useCallback((groupName: string) => {
        setGroups(prev => {
            if (!prev.includes(groupName)) {
                return [...prev, groupName];
            }
            return prev;
        });
    }, [setGroups]);

    const handleRemoveExercise = useCallback((id: string) => {
        setPlannedExercises(prev => prev.filter((ex) => ex.id !== id));
    }, [setPlannedExercises]);

    const handleDeleteExerciseFromMenu = useCallback((id: string) => {
        setExercises(prev => prev.filter(ex => ex.id !== id));
    }, [setExercises]);

    const handleDeleteSection = useCallback((sectionName: string, group: string) => {
        setSections(prev => prev.filter(s => !(s.name === sectionName && s.group === group)));
        setExercises(prev => prev.filter(ex => !(ex.section === sectionName && ex.group === group)));
    }, [setSections, setExercises]);

    const handleDeleteGroup = useCallback((groupName: string) => {
        // Eliminar ejercicios del grupo
        setExercises(prev => prev.filter(ex => ex.group !== groupName));
        // Eliminar secciones del grupo
        setSections(prev => prev.filter(s => s.group !== groupName));
        // Eliminar el grupo
        setGroups(prev => prev.filter(g => g !== groupName));
    }, [setExercises, setSections, setGroups]);

    const handleMoveExerciseToSection = useCallback((exerciseId: string, newSection: string) => {
        setExercises(prev => prev.map(ex =>
            ex.id === exerciseId ? { ...ex, section: newSection } : ex
        ));
    }, [setExercises]);

    const handleRenameExercise = useCallback((exerciseId: string, newName: string) => {
        setExercises(prev => prev.map(ex =>
            ex.id === exerciseId ? { ...ex, name: newName } : ex
        ));
    }, [setExercises]);

    const handleUpdateExercise = useCallback((exerciseId: string, updates: Partial<Exercise>) => {
        setExercises(prev => prev.map(ex =>
            ex.id === exerciseId ? { ...ex, ...updates } : ex
        ));
    }, [setExercises]);

    const handleRenameSection = useCallback((oldName: string, newName: string, group: string) => {
        setSections(prev => prev.map(s =>
            (s.name === oldName && s.group === group) ? { ...s, name: newName } : s
        ));
        setExercises(prev => prev.map(ex =>
            ex.section === oldName ? { ...ex, section: newName } : ex
        ));
    }, [setSections, setExercises]);

    const handleAddToPlan = useCallback((exercise: Exercise) => {
        if (isEditMode) return;

        const newItem = createPlannedExercise(exercise);
        setPlannedExercises(prev => [...prev, newItem]);
    }, [isEditMode, setPlannedExercises]);

    const handleClearAll = useCallback(() => {
        setPlannedExercises([]);
    }, [setPlannedExercises]);

    const handleUpdatePlannedExercise = useCallback((id: string, updates: Partial<PlannedExercise>) => {
        setPlannedExercises(prev => prev.map(ex =>
            ex.id === id ? { ...ex, ...updates } : ex
        ));
    }, [setPlannedExercises]);

    return {
        handleAddExercise,
        handleAddSection,
        handleAddGroup,
        handleRemoveExercise,
        handleDeleteExerciseFromMenu,
        handleDeleteSection,
        handleDeleteGroup,
        handleMoveExerciseToSection,
        handleRenameExercise,
        handleUpdateExercise,
        handleRenameSection,
        handleAddToPlan,
        handleClearAll,
        handleUpdatePlannedExercise,
    };
}
