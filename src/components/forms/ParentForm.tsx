"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useFormState } from "react-dom";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { createParent, updateParent, type CurrentState } from "@/lib/actions";
import { createParentSchema, updateParentSchema } from "../../lib/formValidationSchemas";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getAllStudents } from "@/lib/student-actions";
import { Student, Prisma } from "@prisma/client";
import { StudentWithClass } from "@/lib/student-actions";

interface ParentFormProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "create" | "update";
  data?: any;
  relatedData?: any;
}

interface ImageData {
  secure_url: string;
  public_id: string;
}

type FormData = {
  id?: string;
  username: string;
  name: string;
  surname: string;
  email: string;
  password?: string;
  phone?: string;
  address: string;
  img?: string | null;
  studentIds?: string[];
};

const ParentForm: React.FC<ParentFormProps> = ({
  setOpen,
  type,
  data,
}) => {
  const router = useRouter();
  const [img, setImg] = useState<ImageData | null>(data?.img || null);
  const [formError, setFormError] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentWithClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(type === 'create' ? createParentSchema : updateParentSchema),
    defaultValues: {
      ...data,
      password: '', // Don't pre-fill password
    },
  });

  // useFormState for server actions
  const [state, formAction] = useFormState(
    type === 'create' ? createParent : updateParent,
    { success: false, error: false }
  );

  // Fetch students and initialize form
  useEffect(() => {
    let isMounted = true;
    
    const fetchStudents = async () => {
      console.log('Fetching students from API...');
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/students');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const studentsData = await response.json();
        
        if (!isMounted) return;
        
        if (studentsData.error) {
          throw new Error(studentsData.error);
        }
        
        console.log('Fetched students:', studentsData);
        
        if (studentsData.length === 0) {
          setFormError('No students found in the database. Please add students first.');
        } else {
          setStudents(studentsData);
          setFormError(null);
          
          // If we're in edit mode and have student data, ensure the form is properly initialized
          if (data?.students?.length > 0) {
            console.log('Initializing form with existing student relationships');
            const studentIds = data.students.map((s: any) => s.id);
            reset({
              ...data,
              studentIds,
              password: '' // Don't pre-fill password
            });
          }
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        if (isMounted) {
          setFormError('Failed to load student data. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStudents();
    
    return () => {
      isMounted = false;
    };
  }, [data, reset]);

  // Reset form when data changes (for edit mode)
  useEffect(() => {
    if (data) {
      console.log('Initializing form with data:', {
        ...data,
        password: '***',
        studentIds: data.students?.map((s: any) => s.id) || [],
      });
      
      reset({
        ...data,
        password: '', // Don't pre-fill password
        studentIds: data.students?.map((s: any) => s.id) || [],
      });
    } else {
      console.log('No initial data provided to ParentForm');
      reset({
        username: '',
        name: '',
        surname: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        img: null,
        studentIds: [],
      });
    }
  }, [data, reset]);

  // Handle form submission
  const onSubmit = async (formData: FormData) => {
    setFormError(null);
    // Always ensure password is a string (never undefined)
    const safePassword = formData.password ?? '';
    // Add image to formData
    const formDataWithImage = {
      ...formData,
      password: safePassword,
      img: img?.secure_url || data?.img || null,
    };
    // Call the server action via formAction
    await formAction(formDataWithImage);
  };

  const handleFormSubmit = handleSubmit(onSubmit);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {type === "create" ? "Create New Parent" : "Update Parent Information"}
        </h1>
      </div>
      
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Show error from local state or server action */}
        {(formError || state?.error) && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
            {formError || state?.message}
          </div>
        )}
        {/* Show success toast if needed */}
        {state?.success && toast.success(`Parent ${type === "create" ? "created" : "updated"} successfully!`)}
        
        <div className="flex gap-4 mb-4">
          <div className="w-1/3">
            <div className="relative w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              {img?.secure_url || data?.img ? (
                <Image
                  src={img?.secure_url || data?.img}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  <svg
                    className="w-16 h-16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <CldUploadWidget
              uploadPreset="your_upload_preset"
              onSuccess={(result: any) => {
                if (result?.event === 'success') {
                  setImg({
                    secure_url: result.info.secure_url,
                    public_id: result.info.public_id
                  });
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Upload Photo
                </button>
              )}
            </CldUploadWidget>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Username"
                  name="username"
                  register={register}
                  error={errors.username}
                  required={true}
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  register={register}
                  error={errors.email}
                  required={true}
                />
                {type === "create" && (
                  <InputField
                    label="Password"
                    name="password"
                    type="password"
                    register={register}
                    error={errors.password}
                    required={true}
                  />
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  name="name"
                  register={register}
                  error={errors.name}
                  required={true}
                />
                <InputField
                  label="Last Name"
                  name="surname"
                  register={register}
                  error={errors.surname}
                  required={true}
                />
                <InputField
                  label="Phone"
                  name="phone"
                  type="tel"
                  register={register}
                  error={errors.phone}
                />
                <InputField
                  label="Address"
                  name="address"
                  register={register}
                  error={errors.address}
                  required={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Student Selection */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
            Linked Students
          </h2>
          
          {formError && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
              {formError}
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading students...</p>
            </div>
          ) : students.length > 0 ? (
            <div className="space-y-3">
              <div>
                <label htmlFor="studentIds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Students
                </label>
                <select
                  id="studentIds"
                  multiple
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white h-auto min-h-[100px]"
                  {...register('studentIds')}
                >
                  {students.map((student) => (
                    <option 
                      key={student.id} 
                      value={student.id}
                      className="py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {student.name} {student.surname}
                      {student.email && ` (${student.email})`}
                      {student.class?.name && ` - ${student.class.name}`}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Hold Ctrl/Cmd to select multiple students
                </p>
              </div>
              
              {data?.students && Array.isArray(data.students) && data.students.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currently linked students:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    {data.students.map((student: { id: string; name: string; surname: string; email?: string }) => (
                      <li key={student.id} className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        {student.name} {student.surname}
                        {student.email && ` (${student.email})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No students found. Please add students first.
              </p>
            </div>
          )}
        </div>

        {type === "update" && data?.id && (
          <input type="hidden" {...register("id")} defaultValue={data.id} />
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            disabled={state?.success}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={state?.success}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              state?.success
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {state?.success ? 'Processing...' : type === "create" ? 'Create Parent' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParentForm;
