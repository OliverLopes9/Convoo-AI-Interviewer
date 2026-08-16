import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`bg-primary-surface border border-border rounded-2xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-accent/30' : ''} ${className}`}
        >
            {children}
        </div>
    );
};
