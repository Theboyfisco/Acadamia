import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  label: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  error?: { message?: string };
}

const CustomDropdown = ({
  label,
  options,
  selectedValue,
  onSelect,
  error,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left bg-white dark:bg-gray-800 border ${
          error
            ? "border-red-500 dark:border-red-500"
            : "border-gray-300 dark:border-gray-600"
        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent`}
      >
        <div className="flex items-center justify-between">
          <span className="block truncate text-gray-900 dark:text-white">
            {selectedOption?.label || "Select an option"}
          </span>
          <ChevronDownIcon
            className={`h-5 w-5 text-gray-400 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </button>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.message}</p>
      )}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 cursor-pointer ${
                  option.value === selectedValue
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                    : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown; 