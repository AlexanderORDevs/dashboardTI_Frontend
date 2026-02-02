export default function Select({
  value,
  onChange,
  className = '',
  children,
  ...props
}) {
  const isControlled = value !== undefined;

  return (
    <select
      {...props}
      {...(isControlled ? { value, onChange } : {})}
      className={`block w-full rounded-lg border-2 border-black px-4 py-2 text-lg font-medium transition-shadow focus:shadow-[0_0_0_3px_rgba(156,163,175,0.5)] ${className}`}
    >
      {children}
    </select>
  );
}
