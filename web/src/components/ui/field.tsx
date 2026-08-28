import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Small label+control wrapper shared by every edit form (Sheet-based edit panels, wizards). */
export function Field({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
