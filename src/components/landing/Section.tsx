import { type ReactNode } from 'react';

interface SectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
  background?: 'white' | 'gray' | 'primary';
  padding?: 'normal' | 'large' | 'small';
}

export default function Section({ 
  id, 
  className = '', 
  children, 
  background = 'white',
  padding = 'normal'
}: SectionProps) {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    primary: 'bg-blue-600'
  };

  const paddingClasses = {
    small: 'py-8 lg:py-12',
    normal: 'py-16 lg:py-24',
    large: 'py-20 lg:py-32'
  };

  return (
    <section 
      id={id}
      className={`${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`}
    >
      <div className="container-custom">
        {children}
      </div>
    </section>
  );
}