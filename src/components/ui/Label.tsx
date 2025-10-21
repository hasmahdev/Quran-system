import { LabelHTMLAttributes } from 'react';
import clsx from 'clsx';

export default function UILabel({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={clsx('label', className)} {...props} />;
}
