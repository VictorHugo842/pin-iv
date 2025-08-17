import React from 'react';
import { FieldError } from 'react-hook-form';

interface InputProps {
    type: string;
    placeholder?: string;
    label?: string;
    className?: string;
    maxHeight?: string;
    maxLength?: number;
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
    options?: { value: string; label: string }[];
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
    value?: string | string[]; // Modificado para aceitar string ou string[]
    name?: string;
    error?: FieldError | undefined;  // Corrigido para aceitar FieldError diretamente
}

export default function Input({
    type,
    placeholder,
    label,
    className = '',
    maxHeight,
    maxLength,
    onClick,
    options,
    onChange,
    onBlur,
    value,
    name,
    error,
}: InputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (Array.isArray(value)) {
            const newValue = e.target.value.split(',').map((item) => item.trim());
            onChange && onChange({ target: { value: newValue.join(', ') } } as any); // Passa como string novamente
        } else {
            onChange && onChange(e);
        }
    };

    return (
        <div className="mb-4">
            {label && (
                <label htmlFor={name} className="text-slate-800 text-sm font-medium mb-2 block">
                    {label}
                </label>
            )}

            {type === 'select' ? (
                <select
                    id={name}
                    name={name}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    className={`w-full text-sm text-slate-800 border ${error ? 'border-red-500' : 'border-slate-300'} pl-4 pr-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-0 ${className}`}
                >
                    <option value="" disabled>
                        Selecione uma opção
                    </option>
                    {options?.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    id={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    style={maxHeight ? { maxHeight } : undefined}
                    onClick={onClick}
                    onChange={handleChange}
                    onBlur={onBlur}
                    value={Array.isArray(value) ? value.join(', ') : value} // Se for array, exibe como string
                    className={`w-full text-sm text-slate-800 border ${error ? 'border-[#eb445f]' : 'border-slate-300'} pl-4 pr-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-0 ${className}`}
                />
            )}

            {error && <p className="text-[#ea1d2c] text-xs mt-1">{error.message}</p>}
        </div>
    );
}
