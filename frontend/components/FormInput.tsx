import { forwardRef } from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, ...props }, ref) => (
    <div className="mb-4">
      <label className="block text-white">{label}</label>
      <input
        ref={ref}
        {...props}
        className="w-full p-2 border border-gray-500 bg-black text-white rounded mt-1 focus:ring-2 focus:ring-white"
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  )
);

FormInput.displayName = "FormInput";
export default FormInput;
