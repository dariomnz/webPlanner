import { Exercise, PlannedExercise } from '../types/exercise';

/**
 * Creates a new exercise with a unique ID
 */
export function createExercise(name: string, section: string, group: string, description?: string): Exercise {
    return {
        id: `exercise-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
