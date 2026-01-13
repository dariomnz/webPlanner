import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MenuSectionManager from '../../src/components/MenuExercise/MenuSectionManager';
import { dataStore } from '../../src/store/DataStore';

// Mock icons
vi.mock('../../src/components/Common/Icons', () => ({
    Plus: () => <div data-testid="plus-icon" />,
    FolderPlus: () => <div data-testid="folder-plus-icon" />,
}));

describe('MenuSectionManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns null when not in edit mode', () => {
        const { container } = render(
            <MenuSectionManager selectedGroup="General" isEditMode={false} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders the add section button in edit mode', () => {
        render(
            <MenuSectionManager selectedGroup="General" isEditMode={true} />
        );
        expect(screen.getByText('Nueva Sección')).toBeInTheDocument();
    });

    it('toggles adding section form', () => {
        render(
            <MenuSectionManager selectedGroup="General" isEditMode={true} />
        );

        fireEvent.click(screen.getByText('Nueva Sección'));
        expect(screen.getByText('Nombre de la sección')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Ej: Brazos/i)).toBeInTheDocument();
    });

    it('adds a new section', () => {
        const addSectionSpy = vi.spyOn(dataStore, 'addSection');
        render(
            <MenuSectionManager selectedGroup="General" isEditMode={true} />
        );

        // Open form
        fireEvent.click(screen.getByText('Nueva Sección'));

        // Type section name
        const input = screen.getByPlaceholderText(/Ej: Brazos/i);
        fireEvent.change(input, { target: { value: 'Abs' } });

        // Submit
        fireEvent.submit(input);

        expect(addSectionSpy).toHaveBeenCalledWith('Abs', 'General');
    });
});
