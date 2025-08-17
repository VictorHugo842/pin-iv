interface ButtonProps {
    type: 'submit' | 'button' | 'reset';
    text: string;
    className?: string;
    onClick?: () => void;
}

export default function Button({ type, text, className = '', onClick }: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`
            w-full 
            text-base           /* font-size: 1rem */
            leading-none        /* line-height: 1em */
            flex-grow           /* flex-grow: 1 */
            text-center         /* text-align: center */
            font-semibold
            text-white 
            bg-[#ea1d2c]       /* fundo vermelho */
            border border-transparent 
            px-4 py-3 
            rounded-lg 
            transition-colors duration-200 
            cursor-pointer 
            focus:outline-none 
            hover:bg-[rgba(234,29,44,0.75)]
          ${className}
        `}
        >
            {text}
        </button>
    );
}
