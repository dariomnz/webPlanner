import { useState } from 'react';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import ExerciseMenu from './components/ExerciseMenu/ExerciseMenu.tsx';
import ClassPlanner from './components/ClassPlanner.tsx';
import HeartAnimation from './components/HeartAnimation.tsx';
import { X, Menu } from './components/Icons';
import { DragDropContext } from '@hello-pangea/dnd';


function App() {
    // UI state
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

    const dragAndDrop = useDragAndDrop({
        isEditMode,
        setIsMenuVisible,
    });

    return (
        <>
            <DragDropContext onDragStart={dragAndDrop.handleDragStart} onDragEnd={dragAndDrop.handleDragEnd}>
                <div className="flex flex-col md:flex-row h-dvh w-screen font-sans text-gray-900 overflow-hidden">
                    <ExerciseMenu
                        isEditMode={isEditMode}
                        onEditModeChange={setIsEditMode}
                        isVisible={isMenuVisible}
                    />
                    <ClassPlanner
                        isEditMode={isEditMode}
                    />
                </div>
            </DragDropContext>

            {/* Mobile menu toggle button */}
            <div className="md:hidden fixed bottom-6 left-6 z-50 flex gap-3">
                {/* Menu toggle button */}
                <button
                    onClick={() => setIsMenuVisible(!isMenuVisible)}
                    className="p-4 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition-all active:scale-95"
                    aria-label={isMenuVisible ? "Ocultar menú" : "Mostrar menú"}
                >
                    {isMenuVisible ? <X /> : <Menu />}
                </button>

                {/* Heart button - only visible when menu is open */}
                {isMenuVisible && (
                    <HeartAnimation />
                )}

            </div>


        </>
    );
}

export default App;
