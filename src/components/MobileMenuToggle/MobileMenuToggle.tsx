import HeartAnimation from '../Common/HeartAnimation.tsx';
import { X, Menu } from '../Common/Icons.tsx';

interface MobileMenuToggleProps {
    isMenuVisible: boolean;
    setIsMenuVisible: (visible: boolean) => void;
}

export default function MobileMenuToggle({ isMenuVisible, setIsMenuVisible }: MobileMenuToggleProps) {
    return (
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
    );
}