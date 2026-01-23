export function Container({ children, className = "" }) {
  return <div className={`mx-auto max-w-7xl px-4 ${className}`}>{children}</div>;
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition active:scale-[0.99]";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    ghost: "border border-slate-200 bg-white hover:bg-slate-100 text-slate-800",
    soft: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700",
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
    />
  );
}

export function Select({ className = "", ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
    />
  );
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "border-slate-200 bg-slate-100 text-slate-700",
    blue: "border-indigo-200 bg-indigo-50 text-indigo-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
