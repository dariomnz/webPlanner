import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MenuExerciseItem from '../../src/components/MenuExercise/MenuExerciseItem';
import { dataStore } from '../../src/store/DataStore';

// Mock Draggable from @hello-pangea/dnd
vi.mock('@hello-pangea/dnd', () => ({
    Draggable: ({ children, draggableId, index }: { children: (provided: { draggableProps: object, dragHandleProps: object, innerRef: (el: HTMLElement | null) => void }, snapshot: { isDragging: boolean }) => React.ReactElement, draggableId: string, index: number }) => children({
        draggableProps: { 'data-testid': `draggable-${draggableId}`, 'data-index': index },
        dragHandleProps: {},
        innerRef: vi.fn(),
    }, { isDragging: false }),
}));

// Mock icons
vi.mock('../../src/components/Common/Icons', () => ({
    trash2: () => <div data-testid="trash-icon" />, // lowercase as the component might use it this way or I'll fix the mock
    Trash2: () => <div data-testid="trash-icon" />,
    ChevronDown: () => <div data-testid="chevron-down-icon" />,
    ChevronRight: () => <div data-testid="chevron-right-icon" />,
    AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
    X: () => <div data-testid="x-icon" />,
}));

// Mock AutoResizeTextarea
vi.mock('../../src/components/Common/AutoResizeTextarea', () => ({
    AutoResizeTextarea: ({ value, onChange, onBlur, placeholder, className }: { value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void, placeholder?: string, className: string }) => (
        <textarea
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={className}
            data-testid="auto-resize-textarea"
        />
    ),
}));

describe('MenuExerciseItem', () => {
    const exerciseId = 'ex-1';
    const exercise = { id: exerciseId, name: 'The Hundred', section: 'Core', group: 'Gen', description: 'Breathe' };

    beforeEach(() => {
        vi.clearAllMocks();
        dataStore.setExercises([exercise]);
    });

    it('renders the exercise name', () => {
        render(<MenuExerciseItem exerciseId={exerciseId} index={0} isEditMode={false} />);
        expect(screen.getByText('The Hundred')).toBeInTheDocument();
    });

    it('expands description when clicking chevron', () => {
        render(<MenuExerciseItem exerciseId={exerciseId} index={0} isEditMode={false} />);

        const expandButton = screen.getByTitle('Ver descripción');
        fireEvent.click(expandButton);

        expect(screen.getByText('Breathe')).toBeInTheDocument();
        expect(screen.getByTitle('Ocultar descripción')).toBeInTheDocument();
    });

    it('adds planned exercise when clicked NOT in edit mode', () => {
        const addPlannedSpy = vi.spyOn(dataStore, 'addPlannedExercise');
        render(<MenuExerciseItem exerciseId={exerciseId} index={0} isEditMode={false} />);

        fireEvent.click(screen.getByText('The Hundred'));

        expect(addPlannedSpy).toHaveBeenCalled();
    });

    it('enters edit mode on double click if isEditMode is true', () => {
        render(<MenuExerciseItem exerciseId={exerciseId} index={0} isEditMode={true} />);

        fireEvent.doubleClick(screen.getByText('The Hundred'));

        expect(screen.getByPlaceholderText('Nombre del ejercicio')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Añade una descripción...')).toBeInTheDocument();
    });

    it('updates exercise name in store while editing', () => {
        const updateExerciseSpy = vi.spyOn(dataStore, 'updateExercise');
        render(<MenuExerciseItem exerciseId={exerciseId} index={0} isEditMode={true} />);

        // Enter edit mode
        fireEvent.doubleClick(screen.getByText('The Hundred'));

        // Edit name
        const nameInput = screen.getByPlaceholderText('Nombre del ejercicio');
        fireEvent.change(nameInput, { target: { value: 'New Name' } });

        expect(updateExerciseSpy).toHaveBeenCalledWith(exerciseId, { name: 'New Name' });
    });

    it('shows delete button in edit mode', () => {
        render(<MenuExerciseItem exerciseId={exerciseId} index={0} isEditMode={true} />);
        expect(screen.getByTitle('Eliminar ejercicio')).toBeInTheDocument();
    });

    it('calls removeExercise after delete confirmation', () => {
        const removeExerciseSpy = vi.spyOn(dataStore, 'removeExercise');
        render(<MenuExerciseItem exerciseId={exerciseId} index={0} isEditMode={true} />);

        // Click delete
        fireEvent.click(screen.getByTitle('Eliminar ejercicio'));

        // Confirm
        fireEvent.click(screen.getByText('Sí'));

        // Trigger first animation end (for the "isNew" animation on mount)
        fireEvent.animationEnd(screen.getByTestId(`draggable-menu-${exerciseId}`));

        // Trigger second animation end (for the "isDeleting" animation)
        fireEvent.animationEnd(screen.getByTestId(`draggable-menu-${exerciseId}`));

        expect(removeExerciseSpy).toHaveBeenCalledWith(exerciseId);
    });
});
