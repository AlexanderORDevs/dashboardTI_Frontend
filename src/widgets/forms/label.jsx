export default function Label({ children, htmlFor, className = '', ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`mb-3 block font-sans text-[18px] font-semibold leading-relaxed tracking-normal text-blue-gray-900  ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
