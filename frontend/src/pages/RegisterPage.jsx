import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router";
import { Branding } from "../components";
import { IoMailOutline } from "react-icons/io5";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors((prevErrors) => ({
      ...prevErrors,
      [e.target.name]: "",
      general: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const success = await register(registerData);
    if (success) {
      navigate("/dashboard");
    } else {
      setErrors({ general: "Registration failed. Please try again." });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <Branding />
          <h1 className="mt-6 text-center text-3xl font-extrabold whitespace-nowrap text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          role="form"
          aria-describedby={errors.general ? "form-error" : undefined}
        >
          <div className="space-y-4 rounded-md">
            <div className="relative mb-8">
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-3 text-gray-500"
                aria-hidden="true"
              >
                <FaRegUser className="size-5" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                aria-invalid={!!errors.username}
                aria-describedby={
                  errors.username ? "username-error" : undefined
                }
                className={`relative block w-full appearance-none rounded-md border px-3 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none ${
                  errors.username ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && (
                <p
                  id="username-error"
                  className="absolute top-full left-0 mt-1 text-sm text-red-600"
                >
                  {errors.username}
                </p>
              )}
            </div>
            <div className="relative mb-8">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-3 text-gray-500"
                aria-hidden="true"
              >
                <IoMailOutline className="size-5" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`relative block w-full appearance-none rounded-md border px-3 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="absolute top-full left-0 mt-1 text-sm text-red-600"
                >
                  {errors.email}
                </p>
              )}
            </div>
            <div className="relative mb-8">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-3 text-gray-500"
                aria-hidden="true"
              >
                <RiLockPasswordLine className="size-5" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className={`relative block w-full appearance-none rounded-md border px-3 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 z-20 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <AiOutlineEye className="size-5" />
                ) : (
                  <AiOutlineEyeInvisible className="size-5" />
                )}
              </button>
              {errors.password && (
                <p
                  id="password-error"
                  className="absolute top-full left-0 mt-1 text-sm text-red-600"
                >
                  {errors.password}
                </p>
              )}
            </div>
            <div className="relative mb-8">
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-3 text-gray-500"
                aria-hidden="true"
              >
                <RiLockPasswordLine className="size-5" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirm-password-error" : undefined
                }
                className={`relative block w-full appearance-none rounded-md border px-3 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 z-20 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <AiOutlineEye className="size-5" />
                ) : (
                  <AiOutlineEyeInvisible className="size-5" />
                )}
              </button>
              {errors.confirmPassword && (
                <p
                  id="confirm-password-error"
                  className="absolute top-full left-0 mt-1 text-sm text-red-600"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            {errors.general && (
              <p
                id="form-error"
                className="mt-2 text-center text-sm text-red-600"
              >
                {errors.general}
              </p>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
              aria-busy={loading}
              aria-live="polite"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
