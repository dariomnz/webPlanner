import { useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useExerciseManagement } from './hooks/useExerciseManagement';
import { useMenuVisibility } from './hooks/useMenuVisibility';
import {
    DndContext,
    DragOverlay,
    pointerWithin,
    KeyboardSensor,
    TouchSensor,
    useSensor,
    useSensors,
    MouseSensor,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import ExerciseMenu from './components/ExerciseMenu/ExerciseMenu.tsx';
import ClassPlanner from './components/ClassPlanner.tsx';
import ConfirmationModal from './components/ConfirmationModal.tsx';
import { Exercise, PlannedExercise } from './types';
import { X, Menu } from 'lucide-react';
import { exportClassPlan, exportDataToJson, importDataFromJson } from './utils/exportUtils';

function App() {
    // Local storage state
    const [exercises, setExercises] = useLocalStorage<Exercise[]>('exercises', [
        { id: '1', name: 'The Hundred', section: 'Core' },
        { id: '2', name: 'Roll Up', section: 'Core' },
        { id: '3', name: 'Single Leg Circles', section: 'Legs' },
        { id: '4', name: 'Rolling Like a Ball', section: 'Core' },
        { id: '5', name: 'Single Leg Stretch', section: 'Legs' },
    ]);

    const [sections, setSections] = useLocalStorage<string[]>('sections', ['Core', 'Legs', 'Arms', 'Back']);
    const [plannedExercises, setPlannedExercises] = useLocalStorage<PlannedExercise[]>('planned-exercises', []);
    const [classTitle, setClassTitle] = useLocalStorage<string>('class-title', '');

    // UI state
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
    const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);
    const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
    const [pendingImportData, setPendingImportData] = useState<{ exercises: Exercise[], sections: string[] } | null>(null);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 10 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Custom hooks for business logic
    const exerciseManagement = useExerciseManagement({
        exercises,
        setExercises,
        sections,
        setSections,
        plannedExercises,
        setPlannedExercises,
        isEditMode,
    });

    // Create a stable callback ref for showing menu
    const [activeIdForMenu, setActiveIdForMenu] = useState<string | null>(null);
    const [activeItemSourceForMenu, setActiveItemSourceForMenu] = useState<'menu' | 'planner' | undefined>(undefined);

    const menuVisibility = useMenuVisibility({
        isEditMode,
        activeId: activeIdForMenu,
        activeItemSource: activeItemSourceForMenu,
    });

    const dragAndDrop = useDragAndDrop({
        plannedExercises,
        setPlannedExercises,
        exercises,
        isEditMode,
        onMoveExerciseToSection: exerciseManagement.handleMoveExerciseToSection,
        onDragEndShowMenu: menuVisibility.showMenuOnMobile,
    });

    // Sync drag state to menu visibility
    if (dragAndDrop.activeId !== activeIdForMenu) {
        setActiveIdForMenu(dragAndDrop.activeId);
    }
    if (dragAndDrop.activeItem?.source !== activeItemSourceForMenu) {
        setActiveItemSourceForMenu(dragAndDrop.activeItem?.source);
    }

    // Modal handlers
    const handleDeleteExerciseFromMenu = (id: string) => {
        setExerciseToDelete(id);
    };

    const confirmDeleteExercise = () => {
        if (exerciseToDelete) {
            exerciseManagement.handleDeleteExerciseFromMenu(exerciseToDelete);
            setExerciseToDelete(null);
        }
    };

    const handleDeleteSection = (section: string) => {
        setSectionToDelete(section);
    };

    const confirmDeleteSection = () => {
        if (sectionToDelete) {
            exerciseManagement.handleDeleteSection(sectionToDelete);
            setSectionToDelete(null);
        }
    };

    const handleClearAll = () => {
        setIsClearModalOpen(true);
    };

    const confirmClearAll = () => {
        exerciseManagement.handleClearAll();
        setIsClearModalOpen(false);
    };

    const handleExport = () => {
        exportClassPlan(classTitle, plannedExercises);
    };

    const handleExportExercises = () => {
        const data = {
            exercises,
            sections
        };
        exportDataToJson(data, 'exercises_backup');
    };

    const handleImportExercises = async (file: File) => {
        try {
            const data = await importDataFromJson(file);
            if (data.exercises && Array.isArray(data.exercises) && data.sections && Array.isArray(data.sections)) {
                setPendingImportData(data);
                setIsImportModalOpen(true);
            } else {
                alert('El archivo no tiene el formato correcto.');
            }
        } catch (error) {
            console.error('Error importing exercises:', error);
            alert('Error al leer el archivo.');
        }
    };

    const confirmImport = () => {
        if (pendingImportData) {
            setExercises(pendingImportData.exercises);
            setSections(pendingImportData.sections);
            setPendingImportData(null);
            setIsImportModalOpen(false);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={dragAndDrop.handleDragStart}
            onDragOver={dragAndDrop.handleDragOver}
            onDragEnd={dragAndDrop.handleDragEnd}
            onDragCancel={dragAndDrop.handleDragCancel}
        >
            <div className="flex flex-col h-dvh w-screen font-sans text-gray-900">
                <ExerciseMenu
                    exercises={exercises}
                    sections={sections}
                    onAddExercise={exerciseManagement.handleAddExercise}
                    onAddSection={exerciseManagement.handleAddSection}
                    onAddToPlan={exerciseManagement.handleAddToPlan}
                    onDeleteExercise={handleDeleteExerciseFromMenu}
                    onDeleteSection={handleDeleteSection}
                    onMoveExerciseToSection={exerciseManagement.handleMoveExerciseToSection}
                    onRenameExercise={exerciseManagement.handleRenameExercise}
                    onUpdateExercise={exerciseManagement.handleUpdateExercise}
                    onRenameSection={exerciseManagement.handleRenameSection}
                    isEditMode={isEditMode}
                    onEditModeChange={setIsEditMode}
                    isVisible={menuVisibility.isMenuVisible}
                    onExportExercises={handleExportExercises}
                    onImportExercises={handleImportExercises}
                />
                <ClassPlanner
                    plannedExercises={plannedExercises}
                    onRemoveExercise={exerciseManagement.handleRemoveExercise}
                    onClearAll={handleClearAll}
                    classTitle={classTitle}
                    onTitleChange={setClassTitle}
                    onExport={handleExport}
                />

                {/* Mobile menu toggle button */}
                <button
                    onClick={menuVisibility.toggleMenu}
                    className="md:hidden fixed bottom-6 left-6 z-50 p-4 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition-all active:scale-95"
                    aria-label={menuVisibility.isMenuVisible ? "Ocultar menú" : "Mostrar menú"}
                >
                    {menuVisibility.isMenuVisible ? <X></X> : <Menu></Menu>}
                </button>

                <DragOverlay>
                    {dragAndDrop.activeId && dragAndDrop.activeItem ? (
                        <div className="p-3 bg-white rounded-lg shadow-xl border border-pink-300 opacity-90 w-64 cursor-grabbing">
                            <span className="font-medium text-gray-800">{dragAndDrop.activeItem.name}</span>
                        </div>
                    ) : null}
                </DragOverlay>

                <ConfirmationModal
                    isOpen={isImportModalOpen}
                    onClose={() => {
                        setIsImportModalOpen(false);
                        setPendingImportData(null);
                    }}
                    onConfirm={confirmImport}
                    title="¿Importar ejercicios?"
                    message="¿Estás seguro de que quieres importar estos ejercicios? Se reemplazarán todos los ejercicios y secciones actuales por los del archivo."
                />

                <ConfirmationModal
                    isOpen={isClearModalOpen}
                    onClose={() => setIsClearModalOpen(false)}
                    onConfirm={confirmClearAll}
                    title="¿Borrar toda la clase?"
                    message="¿Estás seguro de que quieres eliminar todos los ejercicios de la planificación? Esta acción no se puede deshacer y perderás el progreso actual."
                />

                <ConfirmationModal
                    isOpen={!!exerciseToDelete}
                    onClose={() => setExerciseToDelete(null)}
                    onConfirm={confirmDeleteExercise}
                    title="¿Eliminar ejercicio?"
                    message="¿Estás seguro de que quieres eliminar este ejercicio de la biblioteca? Se mantendrá en las clases ya planificadas pero no podrás volver a añadirlo."
                />

                <ConfirmationModal
                    isOpen={!!sectionToDelete}
                    onClose={() => setSectionToDelete(null)}
                    onConfirm={confirmDeleteSection}
                    title="¿Eliminar sección?"
                    message={`¿Estás seguro de que quieres eliminar la sección "${sectionToDelete}"? Los ejercicios de esta sección no se borrarán, pasarán a estar "Sin Categoría".`}
                />
            </div>
        </DndContext >
    );
}

export default App;
