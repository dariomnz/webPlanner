import { useRef } from 'react';
import ClassPlannerList from './ClassPlannerList.tsx';
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
}

export default function ClassPlanner({ plannedExercises, onRemoveExercise, onClearAll, classTitle, onTitleChange, onExport, onImport }: ClassPlannerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImport(file);
        }
        if (event.target) event.target.value = '';
    };

    return (
        <div className="flex-1 h-full bg-beige-50 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 text-center relative">

                    <h1 className="text-4xl font-serif text-pink-950 mb-2 font-bold flex items-center justify-center gap-2">
                        <BalletIcon className="fill-pink-300 size-24 inline-block" />
                        Planificación de Clase
                        <BalletIcon className="fill-pink-300 scale-x-[-1] size-24 inline-block" />
                    </h1>
                    <p className="text-pink-800/80 font-medium mb-4">Arrastra ejercicios aquí para construir tu clase</p>

                </header>

                <ClassPlannerList
                    plannedExercises={plannedExercises}
                    onRemoveExercise={onRemoveExercise}
                    classTitle={classTitle}
                    onTitleChange={onTitleChange}
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
