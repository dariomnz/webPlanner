import { useRef, useState, useCallback } from 'react';
import { ClassPlannerList } from './ClassPlannerList.tsx';
import { PlannedExercise } from '../types';
import { Trash2, Download, Upload } from 'lucide-react';
import BalletIcon from '../assets/ballerina.svg?react';


interface ClassPlannerProps {
    plannedExercises: PlannedExercise[];
    onRemoveExercise: (id: string) => void;
    onClearAll: () => void;
    classTitle: string;
    onTitleChange: (title: string) => void;
    onExport: () => void;
    onImport: (file: File) => void;
    onUpdateExercise: (id: string, updates: Partial<PlannedExercise>) => void;
}

export default function ClassPlanner({ plannedExercises, onRemoveExercise, onClearAll, classTitle, onTitleChange, onExport, onImport, onUpdateExercise }: ClassPlannerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLeftBallerinaSpinning, setIsLeftBallerinaSpinning] = useState(false);
    const [isRightBallerinaSpinning, setIsRightBallerinaSpinning] = useState(false);

    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImport(file);
        }
        if (event.target) event.target.value = '';
    }, [onImport]);

    const handleLeftBallerinaClick = useCallback(() => {
        if (isLeftBallerinaSpinning) return;
        setIsLeftBallerinaSpinning(true);
        setTimeout(() => setIsLeftBallerinaSpinning(false), 750); // Duration of one spin
    }, [isLeftBallerinaSpinning]);

    const handleRightBallerinaClick = useCallback(() => {
        if (isRightBallerinaSpinning) return;
        setIsRightBallerinaSpinning(true);
        setTimeout(() => setIsRightBallerinaSpinning(false), 750); // Duration of one spin
    }, [isRightBallerinaSpinning]);

    return (
        <div className="flex-1 h-full bg-beige-50 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 text-center relative">
                    <div className="flex items-center justify-center gap-2">

                        <BalletIcon
                            className={`fill-pink-300 size-24 inline-block cursor-pointer hover:fill-pink-400 transition-colors ${isLeftBallerinaSpinning ? 'animate-ballerina-spin' : ''}`}
                            onClick={handleLeftBallerinaClick}
                        />
                        <h1 className="text-4xl font-serif text-pink-950 mb-2 font-bold "
                            onClick={() => { handleLeftBallerinaClick(); handleRightBallerinaClick(); }}>
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
                    plannedExercises={plannedExercises}
                    onRemoveExercise={onRemoveExercise}
                    classTitle={classTitle}
                    onTitleChange={onTitleChange}
                    onUpdateExercise={onUpdateExercise}
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".html,.json"
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
                                onClick={onExport}
                                className="flex items-center gap-2 px-6 py-3 text-pink-700 bg-white border border-pink-200 hover:bg-pink-50 hover:border-pink-300 rounded-full shadow-sm transition-all duration-200"
                                title="Descargar clase"
                            >
                                <Download size={18} />
                                <span className="font-medium">Descargar Clase</span>
                            </button>
                            <button
                                onClick={onClearAll}
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
    );
}
