
import ClassPlannerList from './ClassPlannerList.tsx';
import { PlannedExercise } from '../types';

interface ClassPlannerProps {
    plannedExercises: PlannedExercise[];
    onRemoveExercise: (id: string) => void;
}

export default function ClassPlanner({ plannedExercises, onRemoveExercise }: ClassPlannerProps) {
    return (
        <div className="flex-1 h-screen bg-beige-50 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-serif text-pink-950 mb-2 font-bold">Planificación de Clase</h1>
                    <p className="text-pink-800/80 font-medium">Arrastra ejercicios aquí para construir tu clase</p>
                </header>

                <ClassPlannerList
                    plannedExercises={plannedExercises}
                    onRemoveExercise={onRemoveExercise}
                />
            </div>
        </div>
    );
}
