import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Universal loading state for tables — 03 Design Principles/states-and-feedback.md
 * ("Loading should feel intelligent... Skeleton UI"). Generic across every
 * department's list view; pass the real column headers so the skeleton
 * layout matches the eventual content instead of a generic bar.
 */
export function TableSkeleton({
  columns,
  rows = 6,
}: {
  columns: string[];
  rows?: number;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col}>{col}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((col, colIndex) => (
              <TableCell key={col}>
                <Skeleton
                  className="h-4"
                  style={{ width: colIndex === 0 ? "70%" : "45%" }}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
