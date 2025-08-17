interface ParagraphProps {
    text: string;
    className?: string;
}

export default function Paragraph({ text, className = '' }: ParagraphProps) {
    return <p className={`text-sm ${className || 'text-slate-800'}`}>{text}</p>;
}
