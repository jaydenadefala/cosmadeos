import { redirect } from "next/navigation";

/**
 * ADR-002: workspaces are working environments, not dashboards — the
 * Training Center workspace's default landing page is Courses (a working
 * catalog), not an overview.
 */
export default function TrainingIndexPage() {
  redirect("/training/courses");
}
