import { useEffect, useMemo } from 'react';
import { Heart } from 'lucide-react';
import BalletIcon from '../assets/ballerina.svg?react';

interface HeartAnimationProps {
    onComplete: () => void;
}

interface Particle {
    x: number;
    y: number;
    size: number;
    delay: number;
    rotation: number;
    duration: number;
}

export default function HeartAnimation({ onComplete }: HeartAnimationProps) {
    useEffect(() => {
        // Auto-close after animation completes
        const timer = setTimeout(() => {
            onComplete();
        }, 2000); // Duration of the animation

        return () => clearTimeout(timer);
    }, [onComplete]);

    // Generate random positions for particles
    const particles = useMemo<Particle[]>(() => {
        return [...Array(16)].map(() => {
            const angle = Math.random() * Math.PI * 2; // Random angle in radians
            const distance = 250 + Math.random() * 50; // Random distance between 100-250px

            return {
                x: Math.cos(angle) * distance, // Calculate X position
                y: Math.sin(angle) * distance, // Calculate Y position
                size: 50 + Math.random() * 70, // Random size between 50-120
                delay: Math.random() * 1, // Random delay between 0-0.3s
                rotation: Math.random() * 360, // Random rotation
                duration: 2, // Random duration between 1.2-1.8s
            };
        });
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            {/* Overlay with fade effect */}
            <div className="absolute inset-0 bg-black/20 animate-fade-in-out" />

            {/* Heart animation */}
            <div className="relative animate-heart-pop">
                <Heart
                    className="text-pink-500 drop-shadow-2xl animate-heart-pulse"
                    size={200}
                    fill="currentColor"
                    strokeWidth={1.5}
                />

                {/* Ballerina icon in the center with spin animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <BalletIcon
                        className="fill-pink-300 animate-ballerina-spin"
                        style={{
                            width: '100px',
                            height: '100px',
                            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
                        }}
                    />
                </div>

                {/* Particles effect */}
                <div className="absolute inset-0">
                    {particles.map((particle, i) => (
                        <div
                            key={i}
                            className="absolute"
                            style={{
                                left: '50%',
                                top: '50%',
                                marginLeft: '-50px', // Half of approximate heart size to center
                                marginTop: '-50px',
                                animation: `particle-move-${i} ${particle.duration}s ease-out forwards`,
                                animationDelay: `${particle.delay}s`,
                                opacity: 0,
                            }}
                        >
                            <Heart
                                className="text-pink-400"
                                size={particle.size}
                                fill="currentColor"
                                style={{
                                    transform: `rotate(${particle.rotation}deg)`,
                                    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                                }}
                            />
                            <style>
                                {`
                                    @keyframes particle-move-${i} {
                                        0% {
                                            transform: translate(0, 0) scale(1);
                                            opacity: 1;
                                        }
                                        100% {
                                            transform: translate(${particle.x}px, ${particle.y}px) scale(0);
                                            opacity: 0;
                                        }
                                    }
                                `}
                            </style>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
