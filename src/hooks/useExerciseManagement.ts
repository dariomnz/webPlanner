import { useCallback } from 'react';
import { Exercise, PlannedExercise } from '../types';
import { createExercise, createPlannedExercise } from '../utils/exerciseHelpers';
import { dataStore } from '../store/DataStore';



export function useExerciseManagement(isEditMode: boolean) {

    const handleAddExercise = useCallback((name: string, section: string, group: string) => {
        const newExercise = createExercise(name, section, group);
        dataStore.setExercises([...dataStore.getExercises(), newExercise]);
    }, []);

    const handleAddSection = useCallback((sectionName: string, group: string) => {
        const sections = dataStore.getSections();
        if (!sections.some(s => s.name === sectionName && s.group === group)) {
            dataStore.setSections([...sections, { name: sectionName, group }]);
        }
    }, []);

    const handleAddGroup = useCallback((groupName: string) => {
        const groups = dataStore.getGroups();
        if (!groups.includes(groupName)) {
            dataStore.setGroups([...groups, groupName]);
        }
    }, []);

    const handleRemoveExercise = useCallback((id: string) => {
        dataStore.setPlannedExercises(dataStore.getPlannedExercises().filter((ex) => ex.id !== id));
    }, []);

    const handleDeleteExerciseFromMenu = useCallback((id: string) => {
        dataStore.setExercises(dataStore.getExercises().filter(ex => ex.id !== id));
    }, []);

    const handleDeleteSection = useCallback((sectionName: string, group: string) => {
        dataStore.setSections(dataStore.getSections().filter(s => !(s.name === sectionName && s.group === group)));
        dataStore.setExercises(dataStore.getExercises().filter(ex => !(ex.section === sectionName && ex.group === group)));
    }, []);

    const handleDeleteGroup = useCallback((groupName: string) => {
        dataStore.setExercises(dataStore.getExercises().filter(ex => ex.group !== groupName));
        dataStore.setSections(dataStore.getSections().filter(s => s.group !== groupName));
        dataStore.setGroups(dataStore.getGroups().filter(g => g !== groupName));
    }, []);

    const handleRenameExercise = useCallback((exerciseId: string, newName: string) => {
        dataStore.updateExercise(exerciseId, { name: newName });
    }, []);

    const handleUpdateExercise = useCallback((exerciseId: string, updates: Partial<Exercise>) => {
        dataStore.updateExercise(exerciseId, updates);
    }, []);

    const handleRenameSection = useCallback((oldName: string, newName: string, group: string) => {
        dataStore.setSections(dataStore.getSections().map(s =>
            (s.name === oldName && s.group === group) ? { ...s, name: newName } : s
        ));
        dataStore.setExercises(dataStore.getExercises().map(ex =>
            ex.section === oldName ? { ...ex, section: newName } : ex
        ));
    }, []);

    const handleAddToPlan = useCallback((exercise: Exercise) => {
        if (isEditMode) return;

        const newItem = createPlannedExercise(exercise);
        dataStore.setPlannedExercises([...dataStore.getPlannedExercises(), newItem]);
    }, [isEditMode]);

    const handleClearAll = useCallback(() => {
        dataStore.clearPlannedExercises();
    }, []);

    const handleUpdatePlannedExercise = useCallback((id: string, updates: Partial<PlannedExercise>) => {
        dataStore.updateExercise(id, updates);
    }, []);

    return {
        handleAddExercise,
        handleAddSection,
        handleAddGroup,
        handleRemoveExercise,
        handleDeleteExerciseFromMenu,
        handleDeleteSection,
        handleDeleteGroup,
        handleRenameExercise,
        handleUpdateExercise,
        handleRenameSection,
        handleAddToPlan,
        handleClearAll,
        handleUpdatePlannedExercise,
    };
}

