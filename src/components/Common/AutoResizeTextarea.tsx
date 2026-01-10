import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
}

export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
    ({ value, ...props }, ref) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);

        // We use useImperativeHandle to expose the local textareaRef to the parent
        useImperativeHandle(ref, () => textareaRef.current!);

        const updateHeight = useCallback(() => {
            const textarea = textareaRef.current;
            if (textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
        }, [textareaRef]);

        useEffect(() => {
            updateHeight();
            // Also update on window resize to ensure height is correct
            window.addEventListener('resize', updateHeight);
            return () => window.removeEventListener('resize', updateHeight);
        }, [value, updateHeight]);

        const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
            const val = e.currentTarget.value;
            e.currentTarget.setSelectionRange(val.length, val.length);
            props.onFocus?.(e);
        };

        return (
            <textarea
                {...props}
                ref={textareaRef}
                value={value}
                onFocus={handleFocus}
                className={`resize-none overflow-hidden ${props.className || ''}`}
            />
        );
    }
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';
