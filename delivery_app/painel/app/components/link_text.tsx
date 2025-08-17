import React from 'react';

interface LinkTextProps {
    href: string;
    text?: string; // Agora text é opcional
    className?: string;
    onClick?: () => void;
    children?: React.ReactNode; // Aceita children
}

export default function LinkText({ href, text, className = '', onClick, children }: LinkTextProps) {
    return (
        <a
            href={href}
            className={`transition cursor-pointer ${className}`}
            onClick={onClick}
        >
            {children || text}
        </a>
    );
}
