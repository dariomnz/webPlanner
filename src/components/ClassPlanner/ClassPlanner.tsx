import { useRef, useState, useCallback } from 'react';
import ClassPlannerList from './ClassPlannerList.tsx';
import { Trash2, Download, Upload, BalletIcon } from '../Common/Icons.tsx';
import { dataStore } from '../../store/DataStore.ts';
import ConfirmationModal from '../Common/ConfirmationModal.tsx';
import { exportClassPlan, importClassPlan } from '../../utils/exportUtils.ts';
import { useStoreItem } from '../../hooks/useDataStore.ts';


interface ClassPlannerProps {
    isEditMode: boolean;
}

export default function ClassPlanner({ isEditMode }: ClassPlannerProps) {
    const plannedExercises = useStoreItem('planned-exercises', () => dataStore.getPlannedExercises());

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLeftBallerinaSpinning, setIsLeftBallerinaSpinning] = useState(false);
    const [isRightBallerinaSpinning, setIsRightBallerinaSpinning] = useState(false);

    const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);

    const handleClearAll = useCallback(() => {
        setIsClearModalOpen(true);
    }, [setIsClearModalOpen]);

    const confirmClearAll = useCallback(() => {
        dataStore.clearPlannedExercises();
        setIsClearModalOpen(false);
    }, [setIsClearModalOpen]);
    const handleCloseClearModal = useCallback(() => setIsClearModalOpen(false), [setIsClearModalOpen]);

    const handleLeftBallerinaClick = useCallback(() => {
        if (isLeftBallerinaSpinning) return;
        setIsLeftBallerinaSpinning(true);
        setTimeout(() => setIsLeftBallerinaSpinning(false), 750); // Duration of one spin
    }, [isLeftBallerinaSpinning, setIsLeftBallerinaSpinning]);

    const handleRightBallerinaClick = useCallback(() => {
        if (isRightBallerinaSpinning) return;
        setIsRightBallerinaSpinning(true);
        setTimeout(() => setIsRightBallerinaSpinning(false), 750); // Duration of one spin
    }, [isRightBallerinaSpinning, setIsRightBallerinaSpinning]);

    const handleTitleClick = useCallback(() => {
        handleLeftBallerinaClick();
        handleRightBallerinaClick();
    }, [handleLeftBallerinaClick, handleRightBallerinaClick]);

    const handleExport = useCallback(() => {
        exportClassPlan(dataStore.getClassTitle(), dataStore.getPlannedExercises());
    }, []);

    const handleImportClass = useCallback(async (file: File) => {
        try {
            const data = await importClassPlan(file);
            if (data.plannedExercises && Array.isArray(data.plannedExercises)) {
                // Confirm before overwriting if there are existing exercises
                if (dataStore.getPlannedExercises().length > 0) {
                    if (window.confirm('¿Quieres reemplazar la planificación actual con la importada?')) {
                        dataStore.importData({
                            plannedExercises: data.plannedExercises,
                            classTitle: data.classTitle || ''
                        });
                    }
                } else {
                    dataStore.importData({
                        plannedExercises: data.plannedExercises,
                        classTitle: data.classTitle || ''
                    });
                }
            } else {
                alert('El archivo no contiene una planificación válida.');
            }
        } catch (error) {
            console.error('Error importing class plan:', error);
            alert('Error al importar la clase. Asegúrate de que es un archivo válido generado por esta aplicación.');
        }
    }, []);

    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleImportClass(file);
        }
        if (event.target) event.target.value = '';
    }, [handleImportClass]);


    return (
        <>
            <div className="flex-1 h-full bg-beige-50 p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    <header className="mb-8 text-center relative">
                        <div className="flex items-center justify-center gap-2">

                            <BalletIcon
                                className={`fill-pink-300 size-24 inline-block cursor-pointer hover:fill-pink-400 transition-colors ${isLeftBallerinaSpinning ? 'animate-ballerina-spin' : ''}`}
                                onClick={handleLeftBallerinaClick}
                            />
                            <h1 className="text-4xl font-serif text-pink-950 mb-2 font-bold "
                                onClick={handleTitleClick}>
                                Planificación de Clase
                            </h1>
                            <BalletIcon
                                className={`fill-pink-300 scale-x-[-1] size-24 inline-block cursor-pointer hover:fill-pink-400 transition-colors ${isRightBallerinaSpinning ? 'animate-ballerina-spin' : ''}`}
                                onClick={handleRightBallerinaClick}
                            />
                        </div>
                        <p className="text-pink-800/80 font-medium mb-4">Arrastra ejercicios aquí para construir tu clase</p>

                    </header>

                    <ClassPlannerList
                        isEditMode={isEditMode}
                    />

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".html,text/html"
                    />

                    <div className="mt-8 flex justify-center gap-4 flex-wrap">
                        {plannedExercises.length === 0 ? (
                            <button
                                onClick={handleImportClick}
                                className="flex items-center gap-2 px-6 py-3 text-pink-700 bg-white border border-pink-200 hover:bg-pink-50 hover:border-pink-300 rounded-full shadow-sm transition-all duration-200"
                                title="Importar clase"
                            >
                                <Upload size={18} />
                                <span className="font-medium">Importar Clase</span>
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-6 py-3 text-pink-700 bg-white border border-pink-200 hover:bg-pink-50 hover:border-pink-300 rounded-full shadow-sm transition-all duration-200"
                                    title="Descargar clase"
                                >
                                    <Download size={18} />
                                    <span className="font-medium">Descargar Clase</span>
                                </button>
                                <button
                                    onClick={handleClearAll}
                                    className="flex items-center gap-2 px-6 py-3 text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-full shadow-sm transition-all duration-200"
                                    title="Borrar toda la clase"
                                >
                                    <Trash2 size={18} />
                                    <span className="font-medium">Borrar toda la clase</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isClearModalOpen}
                onClose={handleCloseClearModal}
                onConfirm={confirmClearAll}
                title="¿Borrar toda la clase?"
                message="¿Estás seguro de que quieres eliminar todos los ejercicios de la planificación? Esta acción no se puede deshacer y perderás el progreso actual."
            />
        </>
    );
}
