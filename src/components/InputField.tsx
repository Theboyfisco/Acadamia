"use client";

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  register: any;
  error?: any;
  defaultValue?: any;
  hidden?: boolean;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  register,
  error,
  defaultValue,
  hidden,
  className = "",
  placeholder = "",
  required = false
}) => {
  if (hidden) return null;

  return (
    <div className={`w-full ${className}`}>
      <label 
        htmlFor={name} 
        className={`block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}
      >
        {label}
      </label>
      <input
        id={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        {...register(name)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

export default InputField;
