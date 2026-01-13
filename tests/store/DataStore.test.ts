import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataStore } from '../../src/store/DataStore';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
    };
})();

vi.stubGlobal('localStorage', localStorageMock);

describe('DataStore', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
        dataStore.clearPlannedExercises();
        dataStore.setExercises([]);
        dataStore.setGroups([]);
        dataStore.setSections([]);
    });

    it('should add a group correctly', () => {
        dataStore.addGroup('Yoga');
        expect(dataStore.getGroups()).toContain('Yoga');
    });

    it('should not add duplicate groups', () => {
        dataStore.addGroup('Yoga');
        dataStore.addGroup('Yoga');
        expect(dataStore.getGroups().filter(g => g === 'Yoga').length).toBe(1);
    });

    it('should add an exercise', () => {
        const exercise = { id: 'test-1', name: 'Push up', section: 'Arms', group: 'General' };
        dataStore.addExercise(exercise);
        expect(dataStore.getExercises()).toContainEqual(exercise);
    });

    it('should remove a planned exercise', () => {
        const planned = { id: 'p-1', name: 'Squats', section: 'Legs', group: 'General', position: 0 };
        dataStore.addPlannedExercise(planned);
        expect(dataStore.getPlannedExercisesLength()).toBe(1);

        dataStore.removePlannedExercise('p-1');
        expect(dataStore.getPlannedExercisesLength()).toBe(0);
    });

    it('should update class title', () => {
        dataStore.setClassTitle('Morning Workout');
        expect(dataStore.getClassTitle()).toBe('Morning Workout');
    });
});
