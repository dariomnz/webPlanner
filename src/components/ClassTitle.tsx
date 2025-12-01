import { useState } from 'react';
import { Edit2, Check } from 'lucide-react';

interface ClassTitleProps {
    title: string;
    onTitleChange: (title: string) => void;
}

export default function ClassTitle({ title, onTitleChange }: ClassTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState(title);

    const handleStartEdit = () => {
        setTempTitle(title);
        setIsEditing(true);
    };

    const handleSave = () => {
        onTitleChange(tempTitle.trim());
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempTitle(title);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div className="mb-6 pb-4 border-b border-pink-100">
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSave}
                        placeholder="Nombre de la clase (opcional)"
                        className="w-full px-4 py-2 text-xl font-serif font-medium text-pink-950 bg-white border-2 border-pink-300 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                        autoFocus
                    />
                    <button
                        onClick={handleSave}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors flex-shrink-0"
                        title="Guardar título"
                    >
                        <Check size={24} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between group">
                    {title ? (
                        <h2
                            className="text-2xl text-center font-serif font-bold text-pink-950 cursor-pointer hover:text-pink-700 transition-colors flex-grow"
                            onClick={handleStartEdit}
                            title="Click para editar"
                        >
                            {title}
                        </h2>
                    ) : (
                        <button
                            onClick={handleStartEdit}
                            className="w-full text-xl font-serif font-medium text-pink-400 hover:text-pink-600 transition-colors flex items-center gap-2"
                        >
                            <Edit2 size={20} />
                            <span>Añadir título a la clase...</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
