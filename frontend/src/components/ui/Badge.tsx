import React from 'react';

interface BadgeProps {
    variant?: 'beginner' | 'intermediate' | 'expert' | 'success' | 'warning' | 'danger';
    children: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'success', children, className = '' }) => {
    const variants = {
        beginner: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        intermediate: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        expert: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        success: 'bg-success/10 text-success border-success/20',
        warning: 'bg-warning/10 text-warning border-warning/20',
        danger: 'bg-danger/10 text-danger border-danger/20',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
