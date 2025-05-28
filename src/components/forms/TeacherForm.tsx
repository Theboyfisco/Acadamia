"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const TeacherForm = ({
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
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      username: data?.username || '',
      email: data?.email || '',
      name: data?.name || '',
      surname: data?.surname || '',
      phone: data?.phone || '',
      address: data?.address || '',
      bloodType: data?.bloodType || '',
      birthday: data?.birthday?.split('T')[0] || '',
      sex: data?.sex || '',
      subjects: data?.subjects || [],
      id: data?.id || undefined,
    }
  });

  const [img, setImg] = useState<any>(data?.img);

  const [state, formAction] = useFormState(
    type === "create" ? createTeacher : updateTeacher,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    console.log("Teacher form submitted:", formData);
    formAction({ ...formData, img: img?.secure_url });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(`Error ${type === "create" ? "creating" : "updating"} teacher!`);
    }
  }, [state, router, type, setOpen]);

  const { subjects } = relatedData;

  const [isSexDropdownOpen, setIsSexDropdownOpen] = useState(false);
  const [isSubjectsDropdownOpen, setIsSubjectsDropdownOpen] = useState(false);

  const selectedSex = watch("sex");
  const selectedSubjects = watch("subjects");

  const handleSexSelect = (sex: "MALE" | "FEMALE") => {
    setValue("sex", sex, { shouldValidate: true });
    setIsSexDropdownOpen(false);
  };

   const handleSubjectSelect = (id: number) => {
    const currentSubjects = watch("subjects") || [];
    const newSubjects = currentSubjects.includes(id)
      ? currentSubjects.filter((subjectId: number) => subjectId !== id)
      : [...currentSubjects, id];
    setValue("subjects", newSubjects, { shouldValidate: true });
  };


  return (
    <form className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 max-w-4xl mx-auto" onSubmit={onSubmit}>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {type === "create" ? "Create New Teacher" : "Update Teacher Information"}
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
                register={register}
                error={errors?.email}
              />
              <InputField
                label="Username"
                name="username"
                register={register}
                error={errors?.username}
              />
              {type === "create" && (
                <InputField
                  label="Password"
                  name="password"
                  type="password"
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
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="First Name"
            name="name"
            register={register}
            error={errors.name}
          />
          <InputField
            label="Last Name"
            name="surname"
            register={register}
            error={errors.surname}
          />
          <InputField
            label="Phone"
            name="phone"
            register={register}
            error={errors.phone}
          />
          <InputField
            label="Address"
            name="address"
            register={register}
            error={errors.address}
          />
           <InputField
            label="Blood Type"
            name="bloodType"
            register={register}
            error={errors.bloodType}
          />
          <InputField
            label="Birthday"
            name="birthday"
            register={register}
            error={errors.birthday}
            type="date"
          />

           {/* Sex Custom Select */}
           <div className="flex flex-col gap-1 w-full">
            <label htmlFor="sex" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Sex</label>
             <div className="relative">
              <button
                type="button"
                className="w-full px-4 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                onClick={() => setIsSexDropdownOpen(!isSexDropdownOpen)}
              >
                {selectedSex || 'Select sex'}
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

           {/* Subjects Custom Select */}
           <div className="flex flex-col gap-1 w-full">
            <label htmlFor="subjects" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Subjects (Select multiple with Ctrl/Cmd + click)</label>
             <div className="relative">
              <button
                type="button"
                className="w-full px-4 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                onClick={() => setIsSubjectsDropdownOpen(!isSubjectsDropdownOpen)}
              >
                {selectedSubjects && selectedSubjects.length > 0
                  ? selectedSubjects.map(id => subjects.find((subject: { id: number; name: string }) => subject.id === id)?.name).join(', ')
                  : 'Select subjects'}
              </button>
              {isSubjectsDropdownOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {subjects.map((subject: { id: number; name: string }) => (
                    <li
                      key={subject.id}
                      className={`px-4 py-2 cursor-pointer transition-colors ${selectedSubjects && selectedSubjects.includes(subject.id) ? 'bg-blue-500 text-white dark:bg-blue-700' : 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                      onClick={() => handleSubjectSelect(subject.id)}
                    >
                      {subject.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.subjects?.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.subjects.message.toString()}
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
          {type === "create" ? "Create Teacher" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default TeacherForm;
