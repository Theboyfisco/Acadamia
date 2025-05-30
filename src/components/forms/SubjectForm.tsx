"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

interface SubjectFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}

const SubjectForm = ({ type, data, setOpen, relatedData }: SubjectFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createSubject : updateSubject,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((formData) => {
    console.log("Subject form submitted:", formData);
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Subject has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(`Error ${type === "create" ? "creating" : "updating"} subject!`);
    }
  }, [state, router, type, setOpen]);

  const { teachers } = relatedData;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>(data?.teachers || []);

  const handleTeacherSelect = (id: string) => {
    if (selectedTeachers.includes(id)) {
      setSelectedTeachers(selectedTeachers.filter((i: string) => i !== id));
    } else {
      setSelectedTeachers([...selectedTeachers, id]);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-3xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {type === "create" ? "Create New Subject" : "Update Subject"}
      </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {type === "create"
            ? "Fill in the subject details below."
            : "Edit and save changes to the subject."}
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-6">
        <h2 className="text-md font-semibold text-gray-800 dark:text-white">Subject Details</h2>

        <div className="space-y-4">
        <InputField
            label="Subject Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />

          <div className="w-full">
            <label
              htmlFor="teachers"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Teachers (Select multiple with Ctrl/Cmd + click)
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full px-4 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedTeachers.length > 0
                  ? selectedTeachers.map((id) => teachers.find((t: { id: string; name: string; surname: string }) => t.id === id)?.name + ' ' + teachers.find((t: { id: string; name: string; surname: string }) => t.id === id)?.surname).join(', ')
                  : 'Select teachers'}
              </button>
              {isDropdownOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {teachers.map((teacher: { id: string; name: string; surname: string }) => (
                    <li
                      key={teacher.id}
                      className={`px-4 py-2 cursor-pointer transition-colors ${selectedTeachers.includes(teacher.id) ? 'bg-blue-500 text-white dark:bg-blue-700' : 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                      onClick={() => handleTeacherSelect(teacher.id)}
                    >
                      {teacher.name} {teacher.surname}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.teachers?.message && (
              <p className="text-red-500 text-sm mt-1">{errors.teachers.message.toString()}</p>
            )}
          </div>

          <InputField
            label="Description"
            name="description"
            defaultValue={data?.description}
            register={register}
            error={errors?.description}
            className="col-span-2"
          />
        </div>
      </div>

      {type === "update" && data?.id && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          {type === "create" ? "Create Subject" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default SubjectForm;
