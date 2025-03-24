import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema, SignupData } from "../lib/validation";
import FormInput from "./FormInput";
import Button from "./Button";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { role: "Intern" },
  });

  const onSubmit = async (data: SignupData) => {
    setServerError(null);
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Signup failed");

      alert("Signup successful!");
      reset();
    } catch (error: any) {
      setServerError(error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-black text-white p-6 rounded-lg shadow-lg w-96"
    >
      <h2 className="text-2xl font-semibold text-center mb-4">Sign Up</h2>

      <FormInput label="Name" type="text" {...register("firstname")} error={errors.firstname?.message} />
      <FormInput label="Surname" type="text" {...register("surname")} error={errors.surname?.message} />
      <FormInput label="Email" type="email" {...register("email")} error={errors.email?.message} />

      {/* Role - Radio Buttons */}
      <div className="mb-4">
        <label className="block text-white">Role</label>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="Intern"
              {...register("role")}
              defaultChecked
              className="w-4 h-4 text-white bg-black border-gray-500 focus:ring-white"
            />
            <span>Intern</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="Admin"
              {...register("role")}
              className="w-4 h-4 text-white bg-black border-gray-500 focus:ring-white"
            />
            <span>Admin</span>
          </label>
        </div>
        {errors.role && <p className="text-red-400 text-sm mt-1">{errors.role.message}</p>}
      </div>

      <FormInput label="Password" type="password" {...register("password")} error={errors.password?.message} />
      <FormInput label="Confirm Password" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />

      {serverError && <p className="text-red-400 text-sm mt-2">{serverError}</p>}

      <Button type="submit">Sign Up</Button>
    </form>
  );
}
