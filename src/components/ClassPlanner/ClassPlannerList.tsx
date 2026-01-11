import ClassPlannerItem from './ClassPlannerItem.tsx';
import ClassTitle from './ClassTitle.tsx';
import { Droppable } from '@hello-pangea/dnd';
import { useStoreItem } from '../../hooks/useDataStore.ts';
import { dataStore } from '../../store/DataStore.ts';

interface ClassPlannerListProps {
    isEditMode: boolean;
}

export default function ClassPlannerList({ isEditMode }: ClassPlannerListProps) {
    const plannedExercises = useStoreItem('planned-exercises', () => dataStore.getPlannedExercises());
    return (
        <div className={`min-h-[500px] bg-white/50 rounded-3xl p-6 border-2 border-dashed transition-colors relative border-pink-400 bg-pink-50/50`}>
            <ClassTitle />
            <Droppable droppableId="planner-droppable" type="EXERCISE" isDropDisabled={isEditMode}>
                {(provided, _snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {
                            plannedExercises.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-pink-400/60 mt-10">
                                    <p className="text-xl font-medium">Tu clase está vacía</p>
                                    <p className="text-sm">Añade ejercicios desde el menú lateral</p>
                                </div>
                            ) : (
                                plannedExercises.map((ex, index) => (
                                    <ClassPlannerItem
                                        key={ex.id}
                                        isEditMode={isEditMode}
                                        exerciseId={ex.id}
                                        index={index}
                                    />
                                ))
                            )
                        }
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}
