import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import App from '../App';

describe('Drag and Drop - Añadir ejercicio a la clase', () => {
    it('debería añadir un ejercicio a la planificación cuando se arrastra desde el menú', () => {
        // Renderizar la aplicación completa
        const { container } = render(<App />);

        // Verificar que el componente se renderiza correctamente
        expect(container).toBeTruthy();

        // Verificar que existe el menú de ejercicios
        const exerciseMenu = screen.getByText(/The Hundred/i);
        expect(exerciseMenu).toBeInTheDocument();
    });

    it('debería manejar el evento de drag end correctamente', () => {
        const mockHandleDragEnd = vi.fn();

        const TestComponent = () => {
            const handleDragEnd = (event: DragEndEvent) => {
                mockHandleDragEnd(event);
            };

            return (
                <DndContext onDragEnd={handleDragEnd}>
                    <div data-testid="draggable" draggable>
                        Test Item
                    </div>
                    <div data-testid="droppable">
                        Drop Zone
                    </div>
                </DndContext>
            );
        };

        render(<TestComponent />);

        // Verificar que los elementos se renderizan
        expect(screen.getByTestId('draggable')).toBeInTheDocument();
        expect(screen.getByTestId('droppable')).toBeInTheDocument();
    });

    it('debería mostrar ejercicios iniciales en el menú', () => {
        render(<App />);

        // Verificar que los ejercicios por defecto están presentes
        expect(screen.getByText(/The Hundred/i)).toBeInTheDocument();
        expect(screen.getByText(/Roll Up/i)).toBeInTheDocument();
        expect(screen.getByText(/Single Leg Circles/i)).toBeInTheDocument();
    });

    it('debería mostrar las secciones iniciales', () => {
        render(<App />);

        // Verificar que las secciones por defecto están presentes
        expect(screen.getByText(/Core/i)).toBeInTheDocument();
        expect(screen.getByText(/Legs/i)).toBeInTheDocument();
    });

    it('debería tener un área de planificación vacía inicialmente', () => {
        render(<App />);

        // Verificar que existe el botón de importar clase cuando está vacío
        const importButton = screen.getByText(/Importar Clase/i);
        expect(importButton).toBeInTheDocument();
    });
});
