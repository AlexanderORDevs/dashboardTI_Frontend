import { XCircleIcon } from '@heroicons/react/24/solid';

export function Input({
  id,
  name,
  type,
  placeholder,
  isValidated,
  error,
  value,
  onChange,
  useState,
}) {
  function inputClass() {
    const defaultClass = [
      'font-semibold',
      'rounded-md',
      'caret-accent-blue-500',
      'focus:outline-none',
      'focus:border-accent-blue-500',
      'w-full',
      'py-4',
      'pl-8',
    ];
    return isValidated
      ? [...defaultClass, 'pr-16', 'border-2', 'border-primary-red-500'].join(
          ' '
        )
      : [...defaultClass, 'pr-6', 'border', 'border-gray-300'].join(' ');
  }

  const errorIcon = (isShow) => {
    if (!isShow) return null;

    return (
      <XCircleIcon className="text-primary-red-500 absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2" />
    );
  };

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full">
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClass()}
        />
        {errorIcon(isValidated)}
        {error && <span style={{ color: 'red' }}>{error}</span>}
      </div>
      <p className="text-primary-red-500 text-right text-xs font-semibold italic">
        {isValidated ? error : ''}{' '}
      </p>
    </div>
  );
}
