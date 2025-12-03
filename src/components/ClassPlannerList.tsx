import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortablePlannerItem from './SortablePlannerItem.tsx';
import ClassTitle from './ClassTitle.tsx';
import { PlannedExercise } from '../types';

interface ClassPlannerListProps {
    plannedExercises: PlannedExercise[];
    onRemoveExercise: (id: string) => void;
    classTitle: string;
    onTitleChange: (title: string) => void;
    onUpdateExercise: (id: string, updates: Partial<PlannedExercise>) => void;
}

export default function ClassPlannerList({ plannedExercises, onRemoveExercise, classTitle, onTitleChange, onUpdateExercise }: ClassPlannerListProps) {
    const { setNodeRef } = useDroppable({
        id: 'planner-droppable',
    });

    return (
        <div
            ref={setNodeRef}
            className="min-h-[500px] bg-white/50 rounded-3xl p-6 border-2 border-dashed border-pink-300 hover:border-pink-400 transition-colors shadow-sm relative"
        >
            <ClassTitle
                title={classTitle}
                onTitleChange={onTitleChange}
            />

            <SortableContext
                items={plannedExercises.map(e => e.id)}
                strategy={verticalListSortingStrategy}
            >
                {plannedExercises.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-pink-400/60 mt-10">
                        <p className="text-xl font-medium">Tu clase está vacía</p>
                        <p className="text-sm">Añade ejercicios desde el menú lateral</p>
                    </div>
                ) : (
                    plannedExercises.map((ex) => (
                        <SortablePlannerItem
                            exercise={ex}
                            key={ex.id}
                            onRemove={onRemoveExercise}
                            onUpdateExercise={onUpdateExercise}
                        />
                    ))
                )}
            </SortableContext>
        </div>
    );
}
