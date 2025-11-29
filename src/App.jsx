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

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find if active item is already in the list (preview)
    const isActiveInPlanner = plannedExercises.some(ex => ex.id === activeId);
    const isOverPlanner = over.id === 'planner-droppable' || plannedExercises.some(ex => ex.id === overId);

    // Case 1: Dragging from Menu
    if (active.data.current?.type === 'menu-item') {
      if (isOverPlanner) {
        if (!isActiveInPlanner) {
          // Insert preview
          const newItem = {
            id: activeId,
            name: active.data.current.name,
          };

          setPlannedExercises((items) => {
            const overIndex = items.findIndex((item) => item.id === overId);
            const newIndex = overIndex >= 0 ? overIndex : items.length;
            const newItems = [...items];
            newItems.splice(newIndex, 0, newItem);
            return newItems;
          });
        } else if (activeId !== overId) {
          // Reorder preview item
          setPlannedExercises((items) => {
            const oldIndex = items.findIndex((item) => item.id === activeId);
            const newIndex = items.findIndex((item) => item.id === overId);
            if (oldIndex !== -1 && newIndex !== -1) {
              return arrayMove(items, oldIndex, newIndex);
            }
            return items;
          });
        }
      } else {
        // Dragged out of planner - remove preview
        if (isActiveInPlanner) {
          setPlannedExercises((items) => items.filter((item) => item.id !== activeId));
        }
      }
    }
    // Case 2: Reordering within Planner
    else if (isActiveInPlanner && isOverPlanner && activeId !== overId) {
      setPlannedExercises((items) => {
        const oldIndex = items.findIndex((item) => item.id === activeId);
        const newIndex = items.findIndex((item) => item.id === overId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);

    if (active.data.current?.type === 'menu-item') {
      const isOverPlanner = over && (over.id === 'planner-droppable' || plannedExercises.some(e => e.id === over.id));

      if (isOverPlanner) {
        // Finalize the drop: rename ID
        setPlannedExercises((items) => items.map(item => {
          if (item.id === active.id) {
            return { ...item, id: `planned-${Date.now()}-${Math.floor(Math.random() * 1000)}` };
          }
          return item;
        }));
      } else {
        // Dropped outside: remove preview
        setPlannedExercises((items) => items.filter((item) => item.id !== active.id));
      }
    }
  };

  const handleDragCancel = (event) => {
    setActiveId(null);
    setActiveItem(null);
    const { active } = event;
    if (active.data.current?.type === 'menu-item') {
      setPlannedExercises((items) => items.filter((item) => item.id !== active.id));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
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
