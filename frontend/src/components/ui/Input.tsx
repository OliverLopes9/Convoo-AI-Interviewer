import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: LucideIcon;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon: Icon, error, className = '', ...props }) => {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                )}
                <input
                    className={`w-full ${Icon ? 'pl-12' : 'px-4'} pr-4 py-3 rounded-2xl bg-primary-bg/50 border border-border text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent/50 focus:bg-primary-bg transition-all text-sm font-medium ${error ? 'border-danger/50' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-[10px] font-bold text-danger ml-1">{error}</p>}
        </div>
    );
};
