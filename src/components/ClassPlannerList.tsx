import ClassPlannerItem from './ClassPlannerItem.tsx';
import ClassTitle from './ClassTitle.tsx';
import { PlannedExercise } from '../types';
import { Droppable } from '@hello-pangea/dnd';

interface ClassPlannerListProps {
    plannedExercises: PlannedExercise[];
    onRemoveExercise: (id: string) => void;
    classTitle: string;
    onTitleChange: (title: string) => void;
    onUpdateExercise: (id: string, updates: Partial<PlannedExercise>) => void;
}

export const ClassPlannerList = function ClassPlannerListReal({ plannedExercises, onRemoveExercise, classTitle, onTitleChange, onUpdateExercise }: ClassPlannerListProps) {
    return (
        <Droppable droppableId="planner-droppable" type="EXERCISE">
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                        min-h-[500px] bg-white/50 rounded-3xl p-6 border-2 border-dashed transition-colors shadow-sm relative
                        ${snapshot.isDraggingOver ? 'border-pink-500 bg-pink-50/50' : 'border-pink-300 hover:border-pink-400'}
                    `}
                >
                    <ClassTitle
                        title={classTitle}
                        onTitleChange={onTitleChange}
                    />

                    {plannedExercises.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-pink-400/60 mt-10">
                            <p className="text-xl font-medium">Tu clase está vacía</p>
                            <p className="text-sm">Añade ejercicios desde el menú lateral</p>
                        </div>
                    ) : (
                        plannedExercises.map((ex, index) => (
                            <ClassPlannerItem
                                exercise={ex}
                                key={ex.id}
                                index={index}
                                onRemove={onRemoveExercise}
                                onUpdateExercise={onUpdateExercise}
                            />
                        ))
                    )}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
}
