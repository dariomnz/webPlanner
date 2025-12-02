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
    exercises,
    setExercises,
    sections,
    setSections,
    groups,
    setGroups,
    plannedExercises,
    setPlannedExercises,
    isEditMode,
}: UseExerciseManagementProps) {

    const handleAddExercise = useCallback((name: string, section: string, group: string) => {
        const newExercise = createExercise(name, section, group);
        setExercises([...exercises, newExercise]);
    }, [exercises, setExercises]);

    const handleAddSection = useCallback((sectionName: string, group: string) => {
        if (!sections.some(s => s.name === sectionName && s.group === group)) {
            setSections([...sections, { name: sectionName, group }]);
        }
    }, [sections, setSections]);

    const handleAddGroup = useCallback((groupName: string) => {
        if (!groups.includes(groupName)) {
            setGroups([...groups, groupName]);
        }
    }, [groups, setGroups]);

    const handleRemoveExercise = useCallback((id: string) => {
        setPlannedExercises(plannedExercises.filter((ex) => ex.id !== id));
    }, [plannedExercises, setPlannedExercises]);

    const handleDeleteExerciseFromMenu = useCallback((id: string) => {
        setExercises(exercises.filter(ex => ex.id !== id));
    }, [exercises, setExercises]);

    const handleDeleteSection = useCallback((sectionName: string, group: string) => {
        setSections(sections.filter(s => !(s.name === sectionName && s.group === group)));
        setExercises(exercises.filter(ex => !(ex.section === sectionName && ex.group === group)));
    }, [sections, setSections, exercises, setExercises]);

    const handleDeleteGroup = useCallback((groupName: string) => {
        // Eliminar ejercicios del grupo
        setExercises(exercises.filter(ex => ex.group !== groupName));
        // Eliminar secciones del grupo
        setSections(sections.filter(s => s.group !== groupName));
        // Eliminar el grupo
        setGroups(groups.filter(g => g !== groupName));
    }, [exercises, setExercises, sections, setSections, groups, setGroups]);

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

    const handleRenameSection = useCallback((oldName: string, newName: string, group: string) => {
        setSections(sections.map(s =>
            (s.name === oldName && s.group === group) ? { ...s, name: newName } : s
        ));
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
    };
}
