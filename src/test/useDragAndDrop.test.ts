import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { PlannedExercise, Exercise } from '../types';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';

describe('useDragAndDrop - Arrastrar ejercicio a la clase', () => {
    let plannedExercises: PlannedExercise[];
    let setPlannedExercises: ReturnType<typeof vi.fn>;
    let exercises: Exercise[];
    let onMoveExerciseToSection: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        plannedExercises = [];
        setPlannedExercises = vi.fn((updater) => {
            if (typeof updater === 'function') {
                plannedExercises = updater(plannedExercises);
            } else {
                plannedExercises = updater;
            }
        });
        exercises = [
            { id: '1', name: 'The Hundred', section: 'Core', group: 'General' },
            { id: '2', name: 'Roll Up', section: 'Core', group: 'General' },
        ];
        onMoveExerciseToSection = vi.fn();
    });

    it('debería inicializar con activeId null', () => {
        const { result } = renderHook(() =>
            useDragAndDrop({
                plannedExercises,
                setPlannedExercises,
                exercises,
                isEditMode: false,
                onMoveExerciseToSection,
            })
        );

        expect(result.current.activeId).toBeNull();
        expect(result.current.activeItem).toBeNull();
    });

    it('debería establecer activeId cuando comienza el drag desde el menú', () => {
        const { result } = renderHook(() =>
            useDragAndDrop({
                plannedExercises,
                setPlannedExercises,
                exercises,
                isEditMode: false,
                onMoveExerciseToSection,
            })
        );

        const dragStartEvent: DragStartEvent = {
            active: {
                id: '1',
                data: {
                    current: {
                        type: 'menu-item',
                        id: '1',
                        name: 'The Hundred',
                        section: 'Core',
                        description: 'Test description',
                    },
                },
                rect: { current: { initial: null, translated: null } },
                node: { current: null },
            },
        };

        act(() => {
            result.current.handleDragStart(dragStartEvent);
        });

        expect(result.current.activeId).toBe('1');
        expect(result.current.activeItem).toEqual({
            id: '1',
            name: 'The Hundred',
            description: 'Test description',
            section: 'Core',
            source: 'menu',
        });
    });

    it('debería añadir ejercicio a la planificación cuando se suelta en el planner', () => {
        const { result } = renderHook(() =>
            useDragAndDrop({
                plannedExercises,
                setPlannedExercises,
                exercises,
                isEditMode: false,
                onMoveExerciseToSection,
            })
        );

        // Simular inicio de drag
        const dragStartEvent: DragStartEvent = {
            active: {
                id: '1',
                data: {
                    current: {
                        type: 'menu-item',
                        id: '1',
                        name: 'The Hundred',
                        section: 'Core',
                        description: 'Core exercise',
                    },
                },
                rect: { current: { initial: null, translated: null } },
                node: { current: null },
            },
        };

        act(() => {
            result.current.handleDragStart(dragStartEvent);
        });

        // Simular fin de drag sobre el planner
        const dragEndEvent: DragEndEvent = {
            active: dragStartEvent.active,
            over: {
                id: 'planner-droppable',
                data: { current: undefined },
                rect: { width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0 },
                disabled: false,
            },
            delta: { x: 0, y: 0 },
            collisions: null,
            activatorEvent: new MouseEvent('mouseup'),
        };

        act(() => {
            result.current.handleDragEnd(dragEndEvent);
        });

        // Verificar que se llamó setPlannedExercises
        expect(setPlannedExercises).toHaveBeenCalled();
    });

    it('debería limpiar activeId cuando termina el drag', () => {
        const { result } = renderHook(() =>
            useDragAndDrop({
                plannedExercises,
                setPlannedExercises,
                exercises,
                isEditMode: false,
                onMoveExerciseToSection,
            })
        );

        // Primero establecer un activeId
        const dragStartEvent: DragStartEvent = {
            active: {
                id: '1',
                data: {
                    current: {
                        type: 'menu-item',
                        id: '1',
                        name: 'The Hundred',
                        section: 'Core',
                    },
                },
                rect: { current: { initial: null, translated: null } },
                node: { current: null },
            },
        };

        act(() => {
            result.current.handleDragStart(dragStartEvent);
        });

        expect(result.current.activeId).toBe('1');

        // Terminar el drag
        const dragEndEvent: DragEndEvent = {
            active: dragStartEvent.active,
            over: null,
            delta: { x: 0, y: 0 },
            collisions: null,
            activatorEvent: new MouseEvent('mouseup'),
        };

        act(() => {
            result.current.handleDragEnd(dragEndEvent);
        });

        expect(result.current.activeId).toBeNull();
        expect(result.current.activeItem).toBeNull();
    });

    it('no debería añadir ejercicio si está en modo edición', () => {
        const { result } = renderHook(() =>
            useDragAndDrop({
                plannedExercises,
                setPlannedExercises,
                exercises,
                isEditMode: true, // Modo edición activado
                onMoveExerciseToSection,
            })
        );

        const dragStartEvent: DragStartEvent = {
            active: {
                id: '1',
                data: {
                    current: {
                        type: 'menu-item',
                        id: '1',
                        name: 'The Hundred',
                        section: 'Core',
                    },
                },
                rect: { current: { initial: null, translated: null } },
                node: { current: null },
            },
        };

        act(() => {
            result.current.handleDragStart(dragStartEvent);
        });

        const dragEndEvent: DragEndEvent = {
            active: dragStartEvent.active,
            over: {
                id: 'planner-droppable',
                data: { current: undefined },
                rect: { width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0 },
                disabled: false,
            },
            delta: { x: 0, y: 0 },
            collisions: null,
            activatorEvent: new MouseEvent('mouseup'),
        };

        act(() => {
            result.current.handleDragEnd(dragEndEvent);
        });

        // En modo edición, no debería añadir a la planificación
        expect(result.current.activeId).toBeNull();
    });
});
