import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type Props = InputHTMLAttributes<HTMLInputElement> & {};

const UIInput = forwardRef<HTMLInputElement, Props>(function UIInput({ className, ...props }, ref) {
  return <input ref={ref} className={clsx('input', className)} {...props} />;
});

export default UIInput;
