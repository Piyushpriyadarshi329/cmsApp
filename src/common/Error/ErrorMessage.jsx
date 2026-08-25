import { MdError } from "react-icons/md";

export default function ErrorMessage({
                                       message,
                                       variant = "simple",
                                       icon: Icon = MdError,
                                       showIcon = true,
                                       iconSize = 14,
                                       className = "",
                                       ...props
                                     }) {
  if (!message) {
    return null;
  }
  const baseClasses = "flex items-center gap-1 text-[12px] leading-[18px]";
  const variantClasses = {
    simple: "text-danger",
    border:
        "w-full rounded-[6px] border border-danger/30 px-3 py-2 text-danger",
    background: "w-full rounded-[6px] bg-danger/10 px-3 py-2 text-danger",
    filled: "w-full rounded-[6px] bg-danger px-3 py-2 text-white",
    compact: "gap-1 text-[11px] text-danger",
  };
  return (
      <div
          role="alert"
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          {...props}
      >
        {" "}
        {showIcon && <Icon size={iconSize} aria-hidden="true" />}{" "}
        <span>{message}</span>{" "}
      </div>
  );
}
