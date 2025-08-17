// components/form_card.tsx
import { ReactNode } from 'react';

interface ContainerFormProps {
  children: ReactNode;
}

const ContainerForm = ({ children }: ContainerFormProps) => {
  return (
    <div className="py-8 px-6 max-w-sm w-full border border-slate-300 rounded-lg shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)]">
      {children}
    </div>
  );
};

export default ContainerForm;
