import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDragAndDrop } from '../../src/hooks/useDragAndDrop';
import { dataStore } from '../../src/store/DataStore';

describe('useDragAndDrop', () => {
    const setIsMenuVisible = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        dataStore.clearPlannedExercises();
        dataStore.setExercises([]);
    });

    it('should hide menu on drag start if NOT in edit mode', () => {
        const { result } = renderHook(() => useDragAndDrop({
            isEditMode: false,
            setIsMenuVisible,
        }));

        result.current.handleDragStart({ draggableId: 'test', mode: 'FLUID', source: { droppableId: 's', index: 0 }, type: 'DEFAULT' });

        expect(setIsMenuVisible).toHaveBeenCalledWith(false);
    });

    it('should NOT hide menu on drag start if in edit mode', () => {
        const { result } = renderHook(() => useDragAndDrop({
            isEditMode: true,
            setIsMenuVisible,
        }));

        result.current.handleDragStart({ draggableId: 'test', mode: 'FLUID', source: { droppableId: 's', index: 0 }, type: 'DEFAULT' });

        expect(setIsMenuVisible).not.toHaveBeenCalled();
    });

    it('should reorder planned exercises when dropped in planner', () => {
        const initialPlanned = [
            { id: 'p1', name: 'Ex 1', section: 'S1', group: 'G1' },
            { id: 'p2', name: 'Ex 2', section: 'S1', group: 'G1' },
        ];
        dataStore.setPlannedExercises(initialPlanned);

        const { result } = renderHook(() => useDragAndDrop({
            isEditMode: false,
            setIsMenuVisible,
        }));

        result.current.handleDragEnd({
            draggableId: 'p1',
            source: { droppableId: 'planner-droppable', index: 0 },
            destination: { droppableId: 'planner-droppable', index: 1 },
            mode: 'FLUID',
            reason: 'DROP',
            combine: null,
            type: 'DEFAULT'
        });

        const updated = dataStore.getPlannedExercises();
        expect(updated[0].id).toBe('p2');
        expect(updated[1].id).toBe('p1');
    });

    it('should add exercise to planner when dropped from menu', () => {
        const exercise = { id: 'm1', name: 'Ex 1', section: 'S1', group: 'G1' };
        dataStore.setExercises([exercise]);

        const { result } = renderHook(() => useDragAndDrop({
            isEditMode: false,
            setIsMenuVisible,
        }));

        result.current.handleDragEnd({
            draggableId: 'menu-m1',
            source: { droppableId: 'droppable-section-G1-S1', index: 0 },
            destination: { droppableId: 'planner-droppable', index: 0 },
            mode: 'FLUID',
            reason: 'DROP',
            combine: null,
            type: 'DEFAULT'
        });

        expect(dataStore.getPlannedExercises()).toHaveLength(1);
        expect(dataStore.getPlannedExercises()[0].name).toBe('Ex 1');
    });

});
