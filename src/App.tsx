import { useState } from 'react';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import MenuExercise from './components/MenuExercise/MenuExercise.tsx';
import ClassPlanner from './components/ClassPlanner/ClassPlanner.tsx';
import MobileMenuToggle from './components/MobileMenuToggle/MobileMenuToggle.tsx';
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
                <div className="flex flex-col md:flex-row h-dvh w-screen font-sans text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 overflow-hidden transition-colors duration-300">
                    <MenuExercise
                        isEditMode={isEditMode}
                        onEditModeChange={setIsEditMode}
                        isVisible={isMenuVisible}
                    />
                    <ClassPlanner
                        isEditMode={isEditMode}
                    />
                </div>
            </DragDropContext>

            <MobileMenuToggle
                isMenuVisible={isMenuVisible}
                setIsMenuVisible={setIsMenuVisible}
            />
        </>
    );
}

export default App;
