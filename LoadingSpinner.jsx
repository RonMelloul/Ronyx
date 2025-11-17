import React, { memo } from 'react';
import { ICONS } from '../constants';

// Optimized Loading Spinner Component
const LoadingSpinner = memo(({ size = 'md', message = 'טוען...', fullScreen = false }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            {/* Animated spinner */}
            <div className="relative">
                <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-slate-200 dark:border-slate-600`}></div>
                <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-transparent border-t-blue-500 absolute top-0 left-0`}></div>
                <Icon path={ICONS.loading} className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            
            {/* Loading message */}
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium animate-pulse">
                {message}
            </p>
            
            {/* Loading dots animation */}
            <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '0.6s'
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-xl p-8">
                    {spinner}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {spinner}
        </div>
    );
});

// Inline Icon component for LoadingSpinner
const Icon = memo(({ path, className = "w-4 h-4", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
));

export default LoadingSpinner;