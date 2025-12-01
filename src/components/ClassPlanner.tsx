
import ClassPlannerList from './ClassPlannerList.tsx';
import { PlannedExercise } from '../types';
import { Trash2 } from 'lucide-react';
import BalletIcon from '../assets/ballerina.svg?react';


interface ClassPlannerProps {
    plannedExercises: PlannedExercise[];
    onRemoveExercise: (id: string) => void;
    onClearAll: () => void;
    classTitle: string;
    onTitleChange: (title: string) => void;
}

export default function ClassPlanner({ plannedExercises, onRemoveExercise, onClearAll, classTitle, onTitleChange }: ClassPlannerProps) {
    return (
        <div className="flex-1 h-screen bg-beige-50 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 text-center relative">

                    <h1 className="text-4xl font-serif text-pink-950 mb-2 font-bold flex items-center justify-center gap-2">
                        <BalletIcon className="fill-pink-200 size-24 inline-block" />
                        Planificación de Clase
                        <BalletIcon className="fill-pink-200 scale-x-[-1] size-24 inline-block" />
                    </h1>
                    <p className="text-pink-800/80 font-medium mb-4">Arrastra ejercicios aquí para construir tu clase</p>

                </header>

                <ClassPlannerList
                    plannedExercises={plannedExercises}
                    onRemoveExercise={onRemoveExercise}
                    classTitle={classTitle}
                    onTitleChange={onTitleChange}
                />

                {plannedExercises.length > 0 && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={onClearAll}
                            className="flex items-center gap-2 px-6 py-3 text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-full shadow-sm transition-all duration-200"
                            title="Borrar toda la clase"
                        >
                            <Trash2 size={18} />
                            <span className="font-medium">Borrar toda la clase</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
