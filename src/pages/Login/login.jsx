import { LuBox } from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { loginSchema } from "../../schema/auth/loginschema";
import Input from "../../common/Input/Input";
import Button from "../../common/Button/Button";
import ErrorMessage from "../../common/Error/ErrorMessage";

const Login = () => {
     const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(data) {
    setApiError("");

    const result = await login(data.email, data.password);

    if (!result.success) {
      setApiError(result.error.message);
      return;
    }
    navigate("/");
  }
    return (
            <div className="min-h-screen flex flex-col w-full justify-center items-center bg-white">
      <div className="flex flex-col flex-grow w-full px-4 relative sm:max-w-[360px]">
        <motion.div
          className="w-full flex-1 flex flex-col items-center justify-center bg-surface"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="w-full  bg-white z-10">
            <div className="w-full flex gap-2 items-start">
              <motion.span
                initial={{ rotate: 270 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5 }}
                className="flex"
              >
                <LuBox size={50} className="text-primary" />
              </motion.span>
              <div className="w-full flex flex-col mb-7">
                <h1 className="text-[26px] !text-primary">CMS</h1>
                <p className="text-text-secondary">
                  Sign in to manage your contracts
                </p>
              </div>
            </div>

            <form
              className="flex flex-col gap-4 border border-gray-100 px-8 py-12 rounded-2xl shadow"
              onSubmit={handleSubmit(onSubmit)}
            >
              <ErrorMessage variant="background" message={apiError}/>
              <Input
                label="Email"
                error={errors.email?.message}
                placeholder="you@company.com"
                {...register("email")}
              />

              <Input
                label="Password"
                type="password"
                error={errors.password?.message}
                placeholder="••••••••••••••••"
                {...register("password")}
              />

              <Link
                to="/forgot-password"
                className="self-end text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>

              <Button type="submit" variant="primary" loading={isSubmitting}
                      disabled={isSubmitting}>
                Login
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
    )
}

export default Login