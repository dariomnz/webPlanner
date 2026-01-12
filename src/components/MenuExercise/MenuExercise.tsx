import { useState, useMemo, useCallback } from 'react';
import { Calendar, Pencil, Download, Upload } from '../Common/Icons';
import MenuSection from './MenuSection';
import MenuGroupSelector from './MenuGroupSelector';
import MenuSectionManager from './MenuSectionManager';
import { Droppable } from '@hello-pangea/dnd';
import { useStoreItem } from '../../hooks/useDataStore';
import { dataStore } from '../../store/DataStore';
import { Exercise, PlannedExercise, Section } from '../../types/exercise';
import { exportDataToJson, importDataFromJson } from '../../utils/exportUtils';
import ConfirmationModal from '../Common/ConfirmationModal';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

interface MenuExerciseProps {
    isEditMode: boolean;
    onEditModeChange: (isEditMode: boolean) => void;
    isVisible: boolean;
}

const DEFAULT_GROUP = 'General';
export default function MenuExercise({
    isEditMode,
    onEditModeChange,
    isVisible,
}: MenuExerciseProps) {
    const [selectedGroup, setSelectedGroup] = useState<string>(DEFAULT_GROUP);
    const groups = useStoreItem('groups', () => dataStore.getGroups());
    const sections = useStoreItem('sections', () => dataStore.getSections());
    const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
    const [pendingImportData, setPendingImportData] = useState<{ exercises?: Exercise[], sections?: Section[], groups?: string[], plannedExercises?: PlannedExercise[], classTitle?: string } | null>(null);

    const confirmImport = useCallback(() => {
        if (pendingImportData) {
            dataStore.importData(pendingImportData);
            setPendingImportData(null);
            setIsImportModalOpen(false);
        }
    }, [pendingImportData, setPendingImportData, setIsImportModalOpen]);
    const handleCloseImportModal = useCallback(() => {
        setIsImportModalOpen(false);
        setPendingImportData(null);
    }, [setIsImportModalOpen, setPendingImportData]);

    const handleExportExercises = useCallback(() => {
        const exercises = dataStore.getExercises();
        const sections = dataStore.getSections();
        const groups = dataStore.getGroups();
        const data = {
            exercises,
            sections,
            groups
        };
        exportDataToJson(data, 'exercises_backup');
    }, []);

    const handleImportExercises = useCallback(async (file: File) => {
        try {
            const data = await importDataFromJson(file);
            if (data.exercises && Array.isArray(data.exercises) && data.sections && Array.isArray(data.sections)) {
                // Migración para archivos antiguos que no tienen grupos
                const importedSections = data.sections.map((s: string | Section) =>
                    typeof s === 'string' ? { name: s, group: 'General' } : s
                );
                const importedGroups = data.groups || ['General'];

                setPendingImportData({
                    exercises: data.exercises,
                    sections: importedSections,
                    groups: importedGroups
                });
                setIsImportModalOpen(true);
            } else {
                alert('El archivo no tiene el formato correcto.');
            }
        } catch (error) {
            console.error('Error importing exercises:', error);
            alert('Error al leer el archivo.');
        }
    }, [setPendingImportData, setIsImportModalOpen]);

    // Asegurarse de que el grupo seleccionado existe (sincronización durante el renderizado)
    let groupToUse = selectedGroup;
    if (groups.length > 0 && !groups.includes(selectedGroup)) {
        groupToUse = groups[0];
    } else if (groups.length === 0 && selectedGroup !== '') {
        groupToUse = '';
    }

    if (groupToUse !== selectedGroup) {
        setSelectedGroup(groupToUse);
    }

    const filteredSections = useMemo(() => {
        return sections.filter(s => s.group === selectedGroup);
    }, [sections, selectedGroup]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleImportExercises(file);
        }
        // Reset input value to allow selecting the same file again
        event.target.value = '';
    }, [handleImportExercises]);

    return (
        <>
            <div className={`
            w-80 bg-white dark:bg-gray-900 border-r border-primary-200 dark:border-gray-800 h-full flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10
            md:relative md:left-0
            fixed transition-all duration-300 ease-in-out
            ${isVisible ? 'left-0' : '-left-80'}
        `}>
                <div className="p-4 border-b border-primary-100 dark:border-gray-800 bg-primary-50/30 dark:bg-gray-800/50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-serif text-primary-950 dark:text-primary-200 font-semibold">Ejercicios</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-primary-100 dark:border-gray-700 p-1 rounded-lg shadow-sm">
                                <button
                                    onClick={() => onEditModeChange(false)}
                                    className={`p-2 rounded-md transition-all ${!isEditMode ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    title="Modo Planificación"
                                >
                                    <Calendar size={16} />
                                </button>
                                <button
                                    onClick={() => onEditModeChange(true)}
                                    className={`p-2 rounded-md transition-all ${isEditMode ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    title="Modo Edición"
                                >
                                    <Pencil size={16} />
                                </button>
                            </div>
                            <ThemeToggle />
                        </div>
                    </div>

                    {isEditMode && (
                        <div className="flex items-center gap-2 mb-4">
                            <button
                                onClick={handleExportExercises}
                                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-gray-800 border border-primary-200 dark:border-gray-700 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-medium hover:bg-primary-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                                title="Guardar ejercicios (Backup)"
                            >
                                <Download size={14} />
                                <span>Exportar</span>
                            </button>
                            <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-gray-800 border border-primary-200 dark:border-gray-700 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-medium hover:bg-primary-50 dark:hover:bg-gray-700 transition-all shadow-sm cursor-pointer" title="Cargar ejercicios">
                                <Upload size={14} />
                                <span>Importar</span>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}

                    {/* Selector de grupos */}
                    <MenuGroupSelector
                        groups={groups}
                        selectedGroup={selectedGroup}
                        onSelectGroup={setSelectedGroup}
                        isEditMode={isEditMode}
                    />

                    {/* Gestor de secciones */}
                    <MenuSectionManager
                        selectedGroup={selectedGroup}
                        isEditMode={isEditMode}
                    />
                </div>

                <Droppable droppableId="section-list" type="SECTION" isDropDisabled={!isEditMode}>
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex-1 overflow-y-auto p-4"
                        >
                            {filteredSections.map((section, index) => (
                                <MenuSection
                                    key={`section-${section.group}-${section.name}`}
                                    index={index}
                                    currentGroup={selectedGroup}
                                    title={section.name}
                                    isEditMode={isEditMode}
                                />
                            ))}
                            {provided.placeholder}

                            {filteredSections.length === 0 && (
                                <div className="text-xs text-gray-400 italic py-1">No hay secciones</div>
                            )}

                            <div className="md:hidden h-18"></div>
                        </div>
                    )}
                </Droppable>
            </div>

            <ConfirmationModal
                isOpen={isImportModalOpen}
                onClose={handleCloseImportModal}
                onConfirm={confirmImport}
                title="¿Importar ejercicios?"
                message="¿Estás seguro de que quieres importar estos ejercicios? Se reemplazarán todos los ejercicios y secciones actuales por los del archivo."
            />
        </>
    );
};