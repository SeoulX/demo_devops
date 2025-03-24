interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="w-full bg-white text-black p-2 rounded-lg mt-2 hover:bg-blue-300 transition"
    >
      {children}
    </button>
  );
}
