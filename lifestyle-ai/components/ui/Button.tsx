type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export default function Button({
  children,
  onClick,
  className = "",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 rounded-2xl font-medium transition-all duration-200 active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}
