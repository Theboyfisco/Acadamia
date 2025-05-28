"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { z } from "zod";
import { CldUploadWidget } from "next-cloudinary";

interface ParentFormProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "create" | "update";
  data?: any;
  relatedData?: any;
}

const ParentForm: React.FC<ParentFormProps> = ({
  setOpen,
  type,
  data,
}) => {
  const parentSchema = z.object({
    id: z.string().optional(),
    username: z.string().min(1, "Username is required"),
    name: z.string().min(1, "First Name is required"),
    surname: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    password: z.string().optional().refine(val => {
      if (type === "create") {
        return val !== undefined && val.length > 0;
      }
      return true;
    }, { message: "Password is required for creation" }),
  });

  type ParentSchema = z.infer<typeof parentSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema),
  });

  const [img, setImg] = useState<any>();

  const onSubmit = handleSubmit((formData) => {
    console.log("Parent form submitted:", formData);
    // TODO: Submit data
    setOpen(false);
  });

  return (
    <form className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 max-w-4xl mx-auto" onSubmit={onSubmit}>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {type === "create" ? "Create New Parent" : "Update Parent Information"}
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
        <div className="grid grid-cols-2 gap-3">
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
          {type === "create" ? "Create Parent" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ParentForm;
