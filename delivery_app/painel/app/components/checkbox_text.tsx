interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void; // Aceita o valor booleano diretamente
    label: string;
    className?: string;
}

export default function CheckboxText({ checked, onChange, label, className = '' }: CheckboxProps) {
    return (
        <label className={`flex items-center text-xs ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)} // Passa o valor booleano
                className="mr-2"
            />
            {label}
        </label>
    );
}