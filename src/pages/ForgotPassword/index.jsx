import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuBox } from "react-icons/lu";
import apiClient from "../../services/apiClient";
import Input from "../../common/Input/Input";
import Button from "../../common/Button/Button";
import ErrorMessage from "../../common/Error/ErrorMessage";
import {
    emailSchema,
    otpSchema,
    resetPasswordSchema,
} from "../../schema/auth/forgotPasswordSchema";
import {motion} from "motion/react";

const STEPS = {
    EMAIL: "EMAIL",
    OTP: "OTP",
    RESET: "RESET",
    DONE: "DONE",
};

function unwrap(data) {
    return data?.data ?? data;
}

function extractMessage(error, fallback) {
    const payload = error?.response?.data;
    return payload?.errors || payload?.message || error?.message || fallback;
}

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(STEPS.EMAIL);
    const [email, setEmail] = useState("");
    const [otpToken, setOtpToken] = useState("");
    const [apiError, setApiError] = useState("");

    const emailForm = useForm({ resolver: zodResolver(emailSchema) });
    const otpForm = useForm({ resolver: zodResolver(otpSchema) });
    const resetForm = useForm({ resolver: zodResolver(resetPasswordSchema) });

    const handleGenerateOtp = async (values) => {
        setApiError("");
        try {
            await apiClient.post("/auth/otp", { email: values.email });
            setEmail(values.email);
            setStep(STEPS.OTP);
        } catch (error) {
            setApiError(extractMessage(error, "Failed to send OTP"));
        }
    };

    const handleValidateOtp = async (values) => {
        setApiError("");
        try {
            const { data } = await apiClient.post("/auth/validate", {
                email,
                otp: values.otp,
            });
            setOtpToken(unwrap(data));
            setStep(STEPS.RESET);
        } catch (error) {
            setApiError(extractMessage(error, "Invalid OTP"));
        }
    };

    const handleResetPassword = async (values) => {
        setApiError("");
        try {
            await apiClient.post("/auth/reset", {
                otpToken,
                password: values.password,
            });
            setStep(STEPS.DONE);
        } catch (error) {
            setApiError(extractMessage(error, "Failed to reset password"));
        }
    };

    const handleResendOtp = async () => {
        setApiError("");
        try {
            await apiClient.post("/auth/otp", { email });
        } catch (error) {
            setApiError(extractMessage(error, "Failed to resend OTP"));
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-4">
            <motion.div className="w-full bg-surface sm:max-w-[360px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            >
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
                            {step === STEPS.EMAIL && "Enter your email to receive an OTP"}
                            {step === STEPS.OTP && "Enter the OTP sent to your email"}
                            {step === STEPS.RESET && "Set a new password"}
                            {step === STEPS.DONE && "Password reset successful"}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 px-8 py-12 shadow">
                    <ErrorMessage variant="background" message={apiError} />

                    {step === STEPS.EMAIL && (
                        <form
                            className="flex flex-col gap-4"
                            onSubmit={emailForm.handleSubmit(handleGenerateOtp)}
                        >
                            <Input
                                label="Email"
                                error={emailForm.formState.errors.email?.message}
                                placeholder="you@company.com"
                                {...emailForm.register("email")}
                            />
                            <Button
                                type="submit"
                                loading={emailForm.formState.isSubmitting}
                                disabled={emailForm.formState.isSubmitting}
                            >
                                Generate OTP
                            </Button>
                        </form>
                    )}

                    {step === STEPS.OTP && (
                        <form
                            className="flex flex-col gap-4"
                            onSubmit={otpForm.handleSubmit(handleValidateOtp)}
                        >
                            <p className="text-sm text-text-secondary">
                                OTP sent to <span className="font-medium text-text-primary">{email}</span>
                            </p>
                            <Input
                                label="OTP"
                                error={otpForm.formState.errors.otp?.message}
                                placeholder="Enter OTP"
                                {...otpForm.register("otp")}
                            />
                            <Button
                                type="submit"
                                loading={otpForm.formState.isSubmitting}
                                disabled={otpForm.formState.isSubmitting}
                            >
                                Validate OTP
                            </Button>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Resend OTP
                            </button>
                        </form>
                    )}

                    {step === STEPS.RESET && (
                        <form
                            className="flex flex-col gap-4"
                            onSubmit={resetForm.handleSubmit(handleResetPassword)}
                        >
                            <Input
                                label="New Password"
                                type="password"
                                error={resetForm.formState.errors.password?.message}
                                placeholder="••••••••••••••••"
                                {...resetForm.register("password")}
                            />
                            <Input
                                label="Confirm New Password"
                                type="password"
                                error={resetForm.formState.errors.confirmPassword?.message}
                                placeholder="••••••••••••••••"
                                {...resetForm.register("confirmPassword")}
                            />
                            <Button
                                type="submit"
                                loading={resetForm.formState.isSubmitting}
                                disabled={resetForm.formState.isSubmitting}
                            >
                                Reset Password
                            </Button>
                        </form>
                    )}

                    {step === STEPS.DONE && (
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-text-secondary">
                                Your password has been reset. You can now log in with your new password.
                            </p>
                            <Button type="button" onClick={() => navigate("/login")}>
                                Back to Login
                            </Button>
                        </div>
                    )}

                    {step !== STEPS.DONE && (
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="text-sm font-medium text-text-secondary hover:underline"
                        >
                            Back to Login
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
