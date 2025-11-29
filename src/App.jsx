import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import ExerciseMenu, { DraggableExercise } from './components/ExerciseMenu';
import ClassPlanner from './components/ClassPlanner';

function App() {
  const [exercises, setExercises] = useState([
    { id: '1', name: 'The Hundred' },
    { id: '2', name: 'Roll Up' },
    { id: '3', name: 'Single Leg Circles' },
    { id: '4', name: 'Rolling Like a Ball' },
    { id: '5', name: 'Single Leg Stretch' },
  ]);

  const [plannedExercises, setPlannedExercises] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddExercise = (name) => {
    const newExercise = {
      id: Date.now().toString(),
      name,
    };
    setExercises([...exercises, newExercise]);
  };

  const handleRemoveExercise = (id) => {
    setPlannedExercises(plannedExercises.filter((ex) => ex.id !== id));
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);

    // Determine if we are dragging from menu or planner
    if (active.data.current?.type === 'menu-item') {
      setActiveItem({ ...active.data.current, source: 'menu' });
    } else {
      // Find item in planner
      const item = plannedExercises.find(e => e.id === active.id);
      if (item) setActiveItem({ ...item, source: 'planner' });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);

    if (!over) return;

    // Dragging from Menu to Planner
    const isOverPlanner = over.id === 'planner-droppable' || plannedExercises.some(e => e.id === over.id);

    if (active.data.current?.type === 'menu-item' && isOverPlanner) {
      const newPlannerItem = {
        id: `planned-${Date.now()}`,
        name: active.data.current.name,
        originalId: active.data.current.id,
      };

      if (over.id === 'planner-droppable') {
        // Dropped on the container (empty space or end)
        setPlannedExercises([...plannedExercises, newPlannerItem]);
      } else {
        // Dropped on a specific item - insert before it
        const overIndex = plannedExercises.findIndex(e => e.id === over.id);
        const newItems = [...plannedExercises];
        newItems.splice(overIndex, 0, newPlannerItem);
        setPlannedExercises(newItems);
      }
      return;
    }

    // Reordering within Planner
    if (active.id !== over.id) {
      setPlannedExercises((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-beige-50 font-sans text-gray-900">
        <ExerciseMenu exercises={exercises} onAddExercise={handleAddExercise} />
        <ClassPlanner
          plannedExercises={plannedExercises}
          onRemoveExercise={handleRemoveExercise}
        />

        <DragOverlay>
          {activeId && activeItem ? (
            <div className="p-3 bg-white rounded-lg shadow-xl border border-pink-300 opacity-90 w-64 cursor-grabbing">
              <span className="font-medium text-gray-800">{activeItem.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

export default App;
