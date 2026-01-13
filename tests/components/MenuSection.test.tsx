import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MenuSection from '../../src/components/MenuExercise/MenuSection';
import { dataStore } from '../../src/store/DataStore';

// Mock @hello-pangea/dnd
vi.mock('@hello-pangea/dnd', () => ({
    Draggable: ({ children, draggableId }: { children: (provided: { draggableProps: object, dragHandleProps: object, innerRef: (el: HTMLElement | null) => void }, snapshot: { isDragging: boolean }) => React.ReactElement, draggableId: string }) => children({
        draggableProps: { 'data-testid': `draggable-${draggableId}` },
        dragHandleProps: {},
        innerRef: vi.fn(),
    }, { isDragging: false }),
    Droppable: ({ children, droppableId }: { children: (provided: { droppableProps: object, innerRef: (el: HTMLElement | null) => void, placeholder: React.ReactNode }, snapshot: { isDraggingOver: boolean }) => React.ReactElement, droppableId: string }) => children({
        droppableProps: { 'data-testid': `droppable-${droppableId}` },
        innerRef: vi.fn(),
        placeholder: <div data-testid="placeholder" />,
    }, { isDraggingOver: false }),
}));

// Mock icons
vi.mock('../../src/components/Common/Icons', () => ({
    Plus: () => <div data-testid="plus-icon" />,
    Trash2: () => <div data-testid="trash-icon" />,
    ChevronDown: () => <div data-testid="chevron-down-icon" />,
    ChevronRight: () => <div data-testid="chevron-right-icon" />,
    AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
    X: () => <div data-testid="x-icon" />,
}));

// Mock MenuExerciseItem to avoid deep rendering issues in this test
vi.mock('../../src/components/MenuExercise/MenuExerciseItem', () => ({
    default: ({ exerciseId }: { exerciseId: string }) => <div data-testid="exercise-item">{exerciseId}</div>
}));

// Mock AutoResizeTextarea
vi.mock('../../src/components/Common/AutoResizeTextarea', () => ({
    AutoResizeTextarea: ({ value, onChange, onBlur, className }: { value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void, className: string }) => (
        <textarea
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={className}
            data-testid="auto-resize-textarea"
        />
    ),
}));

describe('MenuSection', () => {
    const title = 'Core';
    const currentGroup = 'General';
    const exercises = [
        { id: 'ex-1', name: 'Ex 1', section: title, group: currentGroup },
        { id: 'ex-2', name: 'Ex 2', section: 'Other', group: currentGroup },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        dataStore.setExercises(exercises);
    });

    it('renders the section title and exercise count', () => {
        render(<MenuSection index={0} currentGroup={currentGroup} title={title} isEditMode={false} />);

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // Only 1 exercise matches title and group
    });

    it('toggles exercises visibility when clicked', () => {
        render(<MenuSection index={0} currentGroup={currentGroup} title={title} isEditMode={false} />);

        // Starts open (implied by default state or logic)
        expect(screen.getByTestId('exercise-item')).toBeInTheDocument();

        // Click to close
        fireEvent.click(screen.getByText(title));
        expect(screen.queryByTestId('exercise-item')).not.toBeInTheDocument();
    });

    it('shows add and delete buttons in edit mode', () => {
        render(<MenuSection index={0} currentGroup={currentGroup} title={title} isEditMode={true} />);

        expect(screen.getByTitle('Añadir ejercicio')).toBeInTheDocument();
        expect(screen.getByTitle('Eliminar sección')).toBeInTheDocument();
    });

    it('adds a new exercise to the section', () => {
        const addExerciseSpy = vi.spyOn(dataStore, 'addExercise');
        render(<MenuSection index={0} currentGroup={currentGroup} title={title} isEditMode={true} />);

        // Click add
        fireEvent.click(screen.getByTitle('Añadir ejercicio'));

        // Type exercise name
        const input = screen.getByPlaceholderText('Nombre del ejercicio...');
        fireEvent.change(input, { target: { value: 'New Exercise' } });

        // Submit
        fireEvent.submit(input);

        expect(addExerciseSpy).toHaveBeenCalledWith(expect.objectContaining({
            name: 'New Exercise',
            section: title,
            group: currentGroup
        }));
    });

    it('enters rename mode on double click if isEditMode is true', () => {
        render(<MenuSection index={0} currentGroup={currentGroup} title={title} isEditMode={true} />);

        fireEvent.doubleClick(screen.getByText(title));

        expect(screen.getByTestId('auto-resize-textarea')).toBeInTheDocument();
        expect(screen.getByText('Guardar Cambios')).toBeInTheDocument();
    });

    it('deletes the section after confirmation', () => {
        const removeSectionSpy = vi.spyOn(dataStore, 'removeSection');
        render(<MenuSection index={0} currentGroup={currentGroup} title={title} isEditMode={true} />);

        // Click delete
        fireEvent.click(screen.getByTitle('Eliminar sección'));

        // Confirm
        fireEvent.click(screen.getByText('Sí'));

        // Trigger first animation end (for the "isNew" animation on mount)
        fireEvent.animationEnd(screen.getByTestId(`draggable-section-${currentGroup}-${title}`));

        // Trigger second animation end (for the "isDeleting" animation)
        fireEvent.animationEnd(screen.getByTestId(`draggable-section-${currentGroup}-${title}`));

        expect(removeSectionSpy).toHaveBeenCalledWith(title, currentGroup);
    });
});
