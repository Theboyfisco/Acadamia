"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  examSchema,
  ExamSchema,
} from "@/lib/formValidationSchemas";
import {
  createExam,
  updateExam,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ExamForm = ({
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
    watch,
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
     defaultValues: {
      title: data?.title || '',
      startTime: data?.startTime?.split('Z')[0] || '',
      endTime: data?.endTime?.split('Z')[0] || '',
      lessonId: data?.lessonId || undefined,
      id: data?.id || undefined,
    }
  });

  const [state, formAction] = useFormState(
    type === "create" ? createExam : updateExam,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    console.log("Exam form submitted:", formData);
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Exam has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(`Error ${type === "create" ? "creating" : "updating"} exam!`);
    }
  }, [state, router, type, setOpen]);

  const { lessons } = relatedData;

  const [isLessonDropdownOpen, setIsLessonDropdownOpen] = useState(false);
  const selectedLessonId = watch("lessonId");

  const handleLessonSelect = (id: number) => {
    setValue("lessonId", id, { shouldValidate: true });
    setIsLessonDropdownOpen(false);
  };


  return (
    <form className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 max-w-4xl mx-auto" onSubmit={onSubmit}>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {type === "create" ? "Create New Exam" : "Update Exam Information"}
        </h1>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Exam Details
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Exam title"
            name="title"
            register={register}
            error={errors?.title}
          />
          <InputField
            label="Start Date"
            name="startTime"
            register={register}
            error={errors?.startTime}
            type="datetime-local"
          />
          <InputField
            label="End Date"
            name="endTime"
            register={register}
            error={errors?.endTime}
            type="datetime-local"
          />

           {/* Lesson Custom Select */}
           <div className="flex flex-col gap-1 w-full">
            <label htmlFor="lessonId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Lesson</label>
            <div className="relative">
              <button
                type="button"
                className="w-full px-4 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                onClick={() => setIsLessonDropdownOpen(!isLessonDropdownOpen)}
              >
                {selectedLessonId
                  ? lessons.find((lesson: { id: number; name: string }) => lesson.id === selectedLessonId)?.name
                  : 'Select lesson'}
              </button>
              {isLessonDropdownOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {lessons.map((lesson: { id: number; name: string }) => (
                    <li
                      key={lesson.id}
                      className={`px-4 py-2 cursor-pointer transition-colors ${selectedLessonId === lesson.id ? 'bg-blue-500 text-white dark:bg-blue-700' : 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                      onClick={() => handleLessonSelect(lesson.id)}
                    >
                      {lesson.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.lessonId?.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lessonId.message.toString()}
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
          {type === "create" ? "Create Exam" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ExamForm;
