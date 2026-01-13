import { describe, it, expect } from 'vitest';
import { createExercise, createPlannedExercise, filterExercisesBySection, renameExercisesSection } from '../../src/utils/exerciseHelpers';

describe('exerciseHelpers', () => {
    it('should create an exercise with a unique ID', () => {
        const exercise = createExercise('Push up', 'Arms', 'General', 'A basic push up');
        expect(exercise.id).toContain('exercise-');
        expect(exercise.name).toBe('Push up');
        expect(exercise.section).toBe('Arms');
        expect(exercise.description).toBe('A basic push up');
    });

    it('should create a planned exercise from an exercise', () => {
        const exercise = { id: 'ex-1', name: 'Plank', section: 'Core', group: 'Gen' };
        const planned = createPlannedExercise(exercise);
        expect(planned.id).toContain('planned-');
        expect(planned.name).toBe(exercise.name);
        expect(planned.section).toBe(exercise.section);
    });

    it('should filter exercises by section', () => {
        const exercises = [
            { id: '1', name: 'E1', section: 'A', group: 'G' },
            { id: '2', name: 'E2', section: 'B', group: 'G' },
            { id: '3', name: 'E3', section: 'A', group: 'G' },
        ];
        const filtered = filterExercisesBySection(exercises, 'A');
        expect(filtered).toHaveLength(2);
        expect(filtered.every(e => e.section === 'A')).toBe(true);
    });

    it('should rename exercises section', () => {
        const exercises = [
            { id: '1', name: 'E1', section: 'A', group: 'G' },
            { id: '2', name: 'E2', section: 'B', group: 'G' },
        ];
        const renamed = renameExercisesSection(exercises, 'A', 'C');
        expect(renamed[0].section).toBe('C');
        expect(renamed[1].section).toBe('B');
    });
});
