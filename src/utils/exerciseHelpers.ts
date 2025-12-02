import { Exercise, PlannedExercise } from '../types';

/**
 * Creates a new exercise with a unique ID
 */
export function createExercise(name: string, section: string, group: string, description?: string): Exercise {
    return {
        id: Date.now().toString(),
        name,
        section,
        group,
        description,
    };
}

/**
 * Creates a new planned exercise with a unique ID
 */
export function createPlannedExercise(exercise: Exercise): PlannedExercise {
    return {
        id: `planned-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: exercise.name,
        section: exercise.section,
        description: exercise.description,
        group: exercise.group,
    };
}

/**
 * Creates a preview exercise for drag operations
 */
export function createPreviewExercise(
    id: string,
    name: string,
    section: string,
    group: string,
    description?: string
): PlannedExercise {
    return {
        id: `${id}-preview`,
        name,
        section,
        group,
        description,
        isPreview: true,
    };
}

/**
 * Finalizes a preview exercise by removing the preview flag and generating a new ID
 */
export function finalizePreviewExercise(exercise: PlannedExercise): PlannedExercise {
    const { isPreview, ...rest } = exercise;
    return {
        ...rest,
        id: `planned-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
}

/**
 * Filters exercises by section
 */
export function filterExercisesBySection(exercises: Exercise[], section: string): Exercise[] {
    return exercises.filter(e => e.section === section);
}



/**
 * Updates an exercise with partial data
 */
export function updateExercise(exercise: Exercise, updates: Partial<Exercise>): Exercise {
    return { ...exercise, ...updates };
}

/**
 * Renames all exercises in a section
 */
export function renameExercisesSection(
    exercises: Exercise[],
    oldSection: string,
    newSection: string
): Exercise[] {
    return exercises.map(ex =>
        ex.section === oldSection ? { ...ex, section: newSection } : ex
    );
}
