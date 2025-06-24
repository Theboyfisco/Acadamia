"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  studentSchema,
  StudentSchema,
} from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import {
  createStudent,
  updateStudent,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { CldUploadWidget } from "next-cloudinary";

const StudentForm = ({
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
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: data?.name || '',
      surname: data?.surname || '',
      email: data?.email || '',
      username: data?.username || '',
      phone: data?.phone || '',
      address: data?.address || '',
      bloodType: data?.bloodType || '',
      birthday: data?.birthday ? new Date(data.birthday) : undefined,
      parentId: data?.parentId || '',
      sex: data?.sex || '',
      gradeId: data?.gradeId || null,
      classId: data?.classId || null,
      id: data?.id || undefined,
    }
  });

  const [img, setImg] = useState<any>(data?.img);
  const [isLoading, setIsLoading] = useState(false);

  const [state, formAction] = useFormState(
    type === "create" ? createStudent : updateStudent,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit(async (formData) => {
    setIsLoading(true);
    const loadingToast = toast.loading(`${type === "create" ? "Creating" : "Updating"} student...`, {
      duration: 3000
    });
    
    try {
      await formAction({ 
        ...formData,
        sex: (selectedSex as "MALE" | "FEMALE") ?? "MALE",
        gradeId: selectedGradeId ?? 1,
        classId: selectedClassId ?? 1,
        img: img?.secure_url 
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast.dismiss(loadingToast);
      toast.error('An error occurred. Please try again.', {
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Student ${type === "create" ? "created" : "updated"} successfully!`, {
        duration: 3000
      });
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(`Failed to ${type === "create" ? "create" : "update"} student. Please try again.`, {
        duration: 3000
      });
    }
  }, [state, router, type, setOpen]);

  const { grades, classes } = relatedData;

  const [isSexDropdownOpen, setIsSexDropdownOpen] = useState(false);
  const [selectedSex, setSelectedSex] = useState<"MALE" | "FEMALE" | null>(data?.sex ?? null);

  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(data?.gradeId);

  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(data?.classId);

  const handleSexSelect = (sex: "MALE" | "FEMALE") => {
    setSelectedSex(sex);
    setValue('sex', sex);
    setIsSexDropdownOpen(false);
  };

  const handleGradeSelect = (gradeId: number) => {
    setSelectedGradeId(gradeId);
    setValue('gradeId', gradeId);
    setIsGradeDropdownOpen(false);
  };

  const handleClassSelect = (classId: number) => {
    setSelectedClassId(classId);
    setValue('classId', classId);
    setIsClassDropdownOpen(false);
  };

  return (
    <form className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 max-w-4xl mx-auto" onSubmit={onSubmit}>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {type === "create" ? "Create New Student" : "Update Student Information"}
      </h1>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="w-1/2">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <CldUploadWidget
              uploadPreset="school"
              onSuccess={(result, { widget }) => {
                setImg(result.info);
                widget.close();
              }}
            >
              {({ open }) => (
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => open()}>
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-gray-500 transition-colors">
                    {img ? (
                      <Image
                        src={img.secure_url}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/upload.png"
                        alt="Upload"
                        width={20}
                        height={20}
                        className="opacity-50 group-hover:opacity-75 transition-opacity"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {img ? "Change Photo" : "Upload Photo"}
                    </p>
                  </div>
                </div>
              )}
            </CldUploadWidget>
          </div>
        </div>

        <div className="w-1/2">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Account Information
            </h2>
            <div className="space-y-2">
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
              <InputField
                label="Username"
                name="username"
                defaultValue={data?.username}
                register={register}
                error={errors?.username}
              />
              {type === "create" && (
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        Personal Information
        </h2>
        <div className="grid grid-cols-3 gap-3">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split('T')[0] : ''}
          register={register}
          error={errors.birthday}
          type="date"
        />
        <InputField
          label="Parent Id"
          name="parentId"
          defaultValue={data?.parentId}
          register={register}
          error={errors.parentId}
        />
          {/* Select fields */}
          {/* Sex Custom Select */}
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="sex" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Sex</label>
             <div className="relative">
              <button
                type="button"
                className="w-full px-4 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                onClick={() => setIsSexDropdownOpen(!isSexDropdownOpen)}
              >
                {selectedSex === 'MALE' ? 'Male' : selectedSex === 'FEMALE' ? 'Female' : 'Select sex'}
              </button>
              {isSexDropdownOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <li
                    className={`px-4 py-2 cursor-pointer transition-colors ${selectedSex === 'MALE' ? 'bg-blue-500 text-white dark:bg-blue-700' : 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                    onClick={() => handleSexSelect('MALE')}
                  >
                    Male
                  </li>
                   <li
                    className={`px-4 py-2 cursor-pointer transition-colors ${selectedSex === 'FEMALE' ? 'bg-blue-500 text-white dark:bg-blue-700' : 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                    onClick={() => handleSexSelect('FEMALE')}
                  >
                    Female
                  </li>
                </ul>
              )}
            </div>
          {errors.sex?.message && (
              <p className="text-red-500 text-sm mt-1">{errors.sex.message.toString()}</p>
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
              <p className="text-red-500 text-sm mt-1">{errors.gradeId.message.toString()}</p>
          )}
        </div>
          {/* Class Custom Select */}
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="classId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Class</label>
             <div className="relative">
              <button
                type="button"
                className="w-full px-4 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
              >
                {selectedClassId
                  ? classes.find((classItem: { id: number; name: string; capacity: number; _count: { students: number }; }) => classItem.id === selectedClassId)?.name
                  : 'Select class'}
              </button>
              {isClassDropdownOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
            {classes.map(
              (classItem: {
                id: number;
                name: string;
                capacity: number;
                _count: { students: number };
              }) => (
                      <li
                        key={classItem.id}
                        className={`px-4 py-2 cursor-pointer transition-colors ${selectedClassId === classItem.id ? 'bg-blue-500 text-white dark:bg-blue-700' : 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                        onClick={() => handleClassSelect(classItem.id)}
                      >
                        {classItem.name}
                      </li>
              )
            )}
                </ul>
              )}
            </div>
          {errors.classId?.message && (
              <p className="text-red-500 text-sm mt-1">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>
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

      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {type === "create" ? "Creating..." : "Updating..."}
            </span>
          ) : (
            type === "create" ? "Create Student" : "Update Student"
          )}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
