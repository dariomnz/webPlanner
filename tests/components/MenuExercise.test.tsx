import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MenuExercise from '../../src/components/MenuExercise/MenuExercise';
import { dataStore } from '../../src/store/DataStore';
import { importDataFromJson } from '../../src/utils/exportUtils';

// Mock child components
vi.mock('../../src/components/MenuExercise/MenuSection', () => ({
    default: ({ title }: { title: string }) => <div data-testid="menu-section">{title}</div>
}));
vi.mock('../../src/components/MenuExercise/MenuGroupSelector', () => ({
    default: ({ selectedGroup, groups }: { selectedGroup: string, groups: string[] }) => <div data-testid="group-selector">{selectedGroup} ({groups.length})</div>
}));
vi.mock('../../src/components/MenuExercise/MenuSectionManager', () => ({
    default: ({ selectedGroup }: { selectedGroup: string }) => <div data-testid="section-manager">{selectedGroup}</div>
}));
vi.mock('../../src/components/ThemeToggle/ThemeToggle', () => ({
    default: () => <div data-testid="theme-toggle" />
}));

// Mock icons
vi.mock('../../src/components/Common/Icons', () => ({
    Calendar: () => <div data-testid="calendar-icon" />,
    Pencil: () => <div data-testid="pencil-icon" />,
    Download: () => <div data-testid="download-icon" />,
    Upload: () => <div data-testid="upload-icon" />,
    AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
    Palette: () => <div data-testid="palette-icon" />,
    X: () => <div data-testid="x-icon" />,
    Heart: () => <div data-testid="heart-icon" />,
    Tag: () => <div data-testid="tag-icon" />,
    Plus: () => <div data-testid="plus-icon" />,
    ChevronDown: () => <div data-testid="chevron-down-icon" />,
    ChevronRight: () => <div data-testid="chevron-right-icon" />,
    Trash2: () => <div data-testid="trash-icon" />,
}));

// Mock exportUtils
vi.mock('../../src/utils/exportUtils', () => ({
    exportDataToJson: vi.fn(),
    importDataFromJson: vi.fn(),
    importClassPlan: vi.fn(),
}));

// Mock @hello-pangea/dnd
vi.mock('@hello-pangea/dnd', () => ({
    Droppable: ({ children }: { children: (provided: { droppableProps: object, innerRef: (el: HTMLElement | null) => void, placeholder: React.ReactNode }, snapshot: { isDraggingOver: boolean }) => React.ReactElement }) => children({
        droppableProps: {},
        innerRef: vi.fn(),
        placeholder: <div data-testid="placeholder" />,
    }, { isDraggingOver: false }),
}));

describe('MenuExercise', () => {
    const sections = [{ name: 'Core', group: 'General' }];
    const groups = ['General', 'Yoga'];

    beforeEach(() => {
        vi.clearAllMocks();
        dataStore.setGroups(groups);
        dataStore.setExercises([]);
        dataStore.setSections(sections);
    });

    it('renders header and components', () => {
        render(
            <MenuExercise
                isEditMode={false}
                onEditModeChange={vi.fn()}
                isVisible={true}
            />
        );

        expect(screen.getByText('Ejercicios')).toBeInTheDocument();
        expect(screen.getByTestId('group-selector')).toBeInTheDocument();
        expect(screen.getByTestId('menu-section')).toBeInTheDocument();
    });

    it('toggles edit mode buttons', () => {
        const onEditModeChange = vi.fn();
        render(
            <MenuExercise
                isEditMode={false}
                onEditModeChange={onEditModeChange}
                isVisible={true}
            />
        );

        fireEvent.click(screen.getByTitle('Modo Edición'));
        expect(onEditModeChange).toHaveBeenCalledWith(true);
    });

    it('shows export/import buttons in edit mode', () => {
        render(
            <MenuExercise
                isEditMode={true}
                onEditModeChange={vi.fn()}
                isVisible={true}
            />
        );

        expect(screen.getByText('Exportar')).toBeInTheDocument();
        expect(screen.getByText('Importar')).toBeInTheDocument();
    });

    it('opens import modal when a file is selected', async () => {
        vi.mocked(importDataFromJson).mockResolvedValue({ exercises: [], sections: [], groups: ['General'] });

        render(
            <MenuExercise
                isEditMode={true}
                onEditModeChange={vi.fn()}
                isVisible={true}
            />
        );

        const file = new File(['{"exercises":[], "sections":[], "groups":[]}'], 'data.json', { type: 'application/json' });
        // Use container to find the hidden input
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('¿Importar ejercicios?')).toBeInTheDocument();
        });
    });
});
