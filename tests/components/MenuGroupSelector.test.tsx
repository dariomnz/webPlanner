import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MenuGroupSelector from '../../src/components/MenuExercise/MenuGroupSelector';
import { dataStore } from '../../src/store/DataStore';

// Mock icons
vi.mock('../../src/components/Common/Icons', () => ({
    Plus: () => <div data-testid="plus-icon" />,
    Tag: () => <div data-testid="tag-icon" />,
    Trash2: () => <div data-testid="trash-icon" />,
    ChevronDown: () => <div data-testid="chevron-down-icon" />,
    AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
    X: () => <div data-testid="x-icon" />,
}));

describe('MenuGroupSelector', () => {
    const groups = ['General', 'Yoga'];
    const selectedGroup = 'General';
    const onSelectGroup = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the select with groups', () => {
        render(
            <MenuGroupSelector
                groups={groups}
                selectedGroup={selectedGroup}
                onSelectGroup={onSelectGroup}
                isEditMode={false}
            />
        );

        expect(screen.getByDisplayValue('General')).toBeInTheDocument();
        expect(screen.getByText('Yoga')).toBeInTheDocument();
    });

    it('calls onSelectGroup when a group is selected', () => {
        render(
            <MenuGroupSelector
                groups={groups}
                selectedGroup={selectedGroup}
                onSelectGroup={onSelectGroup}
                isEditMode={false}
            />
        );

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Yoga' } });
        expect(onSelectGroup).toHaveBeenCalledWith('Yoga');
    });

    it('shows add and delete buttons in edit mode', () => {
        render(
            <MenuGroupSelector
                groups={groups}
                selectedGroup={selectedGroup}
                onSelectGroup={onSelectGroup}
                isEditMode={true}
            />
        );

        expect(screen.getByTitle('Añadir nuevo grupo')).toBeInTheDocument();
        expect(screen.getByTitle(/Eliminar grupo/)).toBeInTheDocument();
    });

    it('toggles add group form', () => {
        render(
            <MenuGroupSelector
                groups={groups}
                selectedGroup={selectedGroup}
                onSelectGroup={onSelectGroup}
                isEditMode={true}
            />
        );

        fireEvent.click(screen.getByTitle('Añadir nuevo grupo'));
        expect(screen.getByPlaceholderText(/Ej: Ballet/i)).toBeInTheDocument();
    });

    it('adds a new group', () => {
        const addGroupSpy = vi.spyOn(dataStore, 'addGroup');
        render(
            <MenuGroupSelector
                groups={groups}
                selectedGroup={selectedGroup}
                onSelectGroup={onSelectGroup}
                isEditMode={true}
            />
        );

        // Open form
        fireEvent.click(screen.getByTitle('Añadir nuevo grupo'));

        // Type group name
        const input = screen.getByPlaceholderText(/Ej: Ballet/i);
        fireEvent.change(input, { target: { value: 'Pilates' } });

        // Submit
        fireEvent.submit(input);

        expect(addGroupSpy).toHaveBeenCalledWith('Pilates');
        expect(onSelectGroup).toHaveBeenCalledWith('Pilates');
    });

    it('deletes a group after confirmation', () => {
        const removeGroupSpy = vi.spyOn(dataStore, 'removeGroup');
        render(
            <MenuGroupSelector
                groups={groups}
                selectedGroup={selectedGroup}
                onSelectGroup={onSelectGroup}
                isEditMode={true}
            />
        );

        // Click delete
        fireEvent.click(screen.getByTitle(/Eliminar grupo/));

        // Confirm
        fireEvent.click(screen.getByText('Sí'));

        expect(removeGroupSpy).toHaveBeenCalledWith('General');
    });
});
