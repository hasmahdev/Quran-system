import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline';
};

export default function UIButton({ className, variant = 'primary', ...props }: Props) {
  return (
    <button
      className={clsx(
        'btn',
        'flex items-center justify-center',
        variant === 'primary' ? 'btn-primary' : 'btn-outline',
        'transition-transform duration-200 ease-in-out active:scale-95',
        className
      )}
      {...props}
    />
  );
}
