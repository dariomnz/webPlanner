import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClassPlanner from '../../src/components/ClassPlanner/ClassPlanner';
import { dataStore } from '../../src/store/DataStore';

// Mock child component
vi.mock('../../src/components/ClassPlanner/ClassPlannerList.tsx', () => ({
    default: () => <div data-testid="class-planner-list" />
}));

// Mock icons
vi.mock('../../src/components/Common/Icons.tsx', () => ({
    Trash2: () => <div data-testid="trash-icon" />,
    Download: () => <div data-testid="download-icon" />,
    Upload: () => <div data-testid="upload-icon" />,
    AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
    X: () => <div data-testid="x-icon" />,
    BalletIcon: ({ onClick, className }: { onClick?: () => void, className?: string }) => <div data-testid="ballet-icon" onClick={onClick} className={className} />
}));

describe('ClassPlanner', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        dataStore.clearPlannedExercises();
    });

    it('renders empty state with import button', () => {
        render(<ClassPlanner isEditMode={false} />);

        expect(screen.getByText('Importar Clase')).toBeInTheDocument();
        expect(screen.queryByText('Descargar Clase')).not.toBeInTheDocument();
    });

    it('renders exercises state with download and clear buttons', () => {
        dataStore.addPlannedExercise({ id: '1', name: 'Ex', section: 'S', group: 'G' });

        render(<ClassPlanner isEditMode={false} />);

        expect(screen.getByText('Descargar Clase')).toBeInTheDocument();
        expect(screen.getByText('Borrar toda la clase')).toBeInTheDocument();
        expect(screen.queryByText('Importar Clase')).not.toBeInTheDocument();
    });

    it('opens confirmation modal when borrar is clicked', () => {
        dataStore.addPlannedExercise({ id: '1', name: 'Ex', section: 'S', group: 'G' });

        render(<ClassPlanner isEditMode={false} />);

        const clearButton = screen.getByText('Borrar toda la clase');
        fireEvent.click(clearButton);

        expect(screen.getByText('¿Borrar toda la clase?')).toBeInTheDocument();
    });

    it('clears all exercises on confirmation', () => {
        dataStore.addPlannedExercise({ id: '1', name: 'Ex', section: 'S', group: 'G' });
        const clearSpy = vi.spyOn(dataStore, 'clearPlannedExercises');

        render(<ClassPlanner isEditMode={false} />);

        // Open modal
        fireEvent.click(screen.getByText('Borrar toda la clase'));

        // Confirm
        fireEvent.click(screen.getByText('Sí'));

        expect(clearSpy).toHaveBeenCalled();
    });
});

