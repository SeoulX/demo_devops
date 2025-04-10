"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, X } from "lucide-react"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginData } from "../lib/validation";

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setServerError(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Login failed");

      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("role", result.role);
      localStorage.setItem("approval", result.approval);

      if (result.role == "Admin") {
        router.push("/admin");
      } else {
        if(result.approval == "Pending"){
          alert("Please wait for approval from the Admin")
          localStorage.removeItem("access_token");
          localStorage.removeItem("role");
          localStorage.removeItem("approval");
          router.push("/login");
        }else if(result.approval == "Rejected"){
          alert("You've been rejected by the Admin")
          localStorage.removeItem("access_token");
          localStorage.removeItem("role");
          localStorage.removeItem("approval");
          router.push("/login");
        }else{
          router.push("/dashboard");
        }
      }
    } catch (error: any) {
      setServerError(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md relative">
        <Link
          href="/"
          className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm hover:bg-primary hover:text-white transition-colors"
          aria-label="Go back home"
          >
          <X className="h-4 w-4" />
        </Link>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        {serverError && (
            <div className="flex justify-center">
              <p className="w-1/2 mb-4 p-2 bg-red-100 text-red-700 border border-red-400 rounded text-center">{serverError}</p>
            </div>
          )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email"
               type="email" 
               placeholder="m@example.com" 
               {...register("email")}
               aria-invalid={errors.email ? "true" : "false"}
               />
               {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
              <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

