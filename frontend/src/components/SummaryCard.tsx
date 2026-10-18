interface SummaryCardProps {
  title: string;
  amount: number;
  variant?: "default" | "dark" | "income" | "expense";
  subtitle?: string;
}

export default function SummaryCard({
  title,
  amount,
  variant = "default",
  subtitle,
}: SummaryCardProps) {
  const base = "rounded-xl p-5 shadow-sm";

  const styles: Record<string, string> = {
    default: `${base} bg-white text-[#0B2545]`,
    dark: `${base} bg-[#1A1A1A] text-white`,
    income: `${base} bg-white text-[#0B2545] border-l-4 border-[#198754]`,
    expense: `${base} bg-white text-[#0B2545] border-l-4 border-[#DC3545]`,
  };

  const amountColor: Record<string, string> = {
    default: "text-[#0B2545]",
    dark: "text-white",
    income: "text-[#198754]",
    expense: "text-[#DC3545]",
  };

  return (
    <div className={styles[variant]}>
      <p
        className={`text-sm font-medium mb-1 ${variant === "dark" ? "text-gray-400" : "text-[#6C757D]"}`}
      >
        {title}
      </p>
      <p className={`text-2xl font-bold ${amountColor[variant]}`}>
        $
        {amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
      {subtitle && (
        <p
          className={`text-xs mt-1 ${variant === "dark" ? "text-gray-500" : "text-[#6C757D]"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
