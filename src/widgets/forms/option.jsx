export default function Option({ children, className = '', ...props }) {
  return (
    <option
      className={`block w-full rounded-lg border-2 border-black px-4 py-2 text-[11px] font-medium transition-shadow focus:shadow-[0_0_0_3px_rgba(156,163,175,0.5)] ${className}`}
      {...props}
    >
      {children}
    </option>
  );
}
