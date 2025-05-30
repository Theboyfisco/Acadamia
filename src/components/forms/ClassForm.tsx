"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  classSchema,
  ClassSchema,
} from "@/lib/formValidationSchemas";
import {
  createClass,
  updateClass,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ClassForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: data?.name || '',
      capacity: data?.capacity || undefined,
      gradeId: data?.gradeId || undefined,
      supervisorId: data?.supervisorId || '',
      id: data?.id || undefined,
    }
  });

  const [state, formAction] = useFormState(
    type === "create" ? createClass : updateClass,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    console.log("Class form submitted:", formData);
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Class has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(`Error ${type === "create" ? "creating" : "updating"} class!`);
    }
  }, [state, router, type, setOpen]);

  const { teachers, grades } = relatedData;

  const [isSupervisorDropdownOpen, setIsSupervisorDropdownOpen] = useState(false);
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);

  const selectedSupervisorId = watch("supervisorId");
  const selectedGradeId = watch("gradeId");

  const handleSupervisorSelect = (id: string) => {
    setValue("supervisorId", id, { shouldValidate: true });
    setIsSupervisorDropdownOpen(false);
  };

   const handleGradeSelect = (id: number) => {
    setValue("gradeId", id, { shouldValidate: true });
    setIsGradeDropdownOpen(false);
  };


  return (
    <form className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 max-w-4xl mx-auto" onSubmit={onSubmit}>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {type === "create" ? "Create New Class" : "Update Class Information"}
      </h1>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Class Details
        </h2>
        <div className="grid grid-cols-2 gap-3">
        <InputField
          label="Class name"
          name="name"
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Capacity"
          name="capacity"
            register={register}
            error={errors?.capacity}
            type="number"
          />

          {/* Supervisor Custom Select */}
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="supervisorId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Supervisor</label>
            <div className="relative">
              <button
                type="button"
                className="w-full px-4 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                onClick={() => setIsSupervisorDropdownOpen(!isSupervisorDropdownOpen)}
              >
                {selectedSupervisorId
                  ? teachers.find((t: { id: string; name: string; surname: string }) => t.id === selectedSupervisorId)?.name + ' ' + teachers.find((t: { id: string; name: string; surname: string }) => t.id === selectedSupervisorId)?.surname
                  : 'Select supervisor'}
              </button>
              {isSupervisorDropdownOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {teachers.map((teacher: { id: string; name: string; surname: string }) => (
                    <li
                  key={teacher.id}
                      className={`px-4 py-2 cursor-pointer transition-colors ${selectedSupervisorId === teacher.id ? 'bg-blue-500 text-white dark:bg-blue-700' : 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                      onClick={() => handleSupervisorSelect(teacher.id)}
                >
                      {teacher.name} {teacher.surname}
                    </li>
                  ))}
                </ul>
            )}
            </div>
          {errors.supervisorId?.message && (
              <p className="text-red-500 text-sm mt-1">
              {errors.supervisorId.message.toString()}
            </p>
          )}
        </div>

          {/* Grade Custom Select */}
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="gradeId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Grade</label>
            <div className="relative">
              <button
                type="button"
                className="w-full px-4 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
              >
                {selectedGradeId
                  ? grades.find((grade: { id: number; level: number }) => grade.id === selectedGradeId)?.level
                  : 'Select grade'}
              </button>
              {isGradeDropdownOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
            {grades.map((grade: { id: number; level: number }) => (
                    <li
                key={grade.id}
                      className={`px-4 py-2 cursor-pointer transition-colors ${selectedGradeId === grade.id ? 'bg-blue-500 text-white dark:bg-blue-700' : 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                      onClick={() => handleGradeSelect(grade.id)}
              >
                {grade.level}
                    </li>
            ))}
                </ul>
              )}
            </div>
          {errors.gradeId?.message && (
              <p className="text-red-500 text-sm mt-1">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>
      </div>
      </div>

      {type === "update" && data?.id && (
        <InputField
          label="Id"
          name="id"
          register={register}
          error={errors?.id}
          hidden
        />
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {type === "create" ? "Create Class" : "Save Changes"}
      </button>
      </div>
    </form>
  );
};

export default ClassForm;
