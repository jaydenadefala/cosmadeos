import {
  LayoutDashboard,
  Users,
  Handshake,
  Megaphone,
  FlaskConical,
  Cog,
  Wallet,
  FileStack,
  BookOpen,
  GraduationCap,
  Building2,
  BarChart3,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

/**
 * Global Navigation Architecture — first-level workspaces.
 * Source: 04 Enterprise Architecture/enterprise-information-architecture.md
 * "Nothing else belongs in the first level." Order is verbatim from source.
 */
export type WorkspaceId =
  | "dashboard"
  | "hr"
  | "sales"
  | "marketing"
  | "research"
  | "operations"
  | "finance"
  | "documents"
  | "knowledge"
  | "training"
  | "customers"
  | "analytics"
  | "administration";

export interface WorkspaceNavItem {
  id: WorkspaceId;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const workspaces: WorkspaceNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
  { id: "hr", label: "People & HR", href: "/hr", icon: Users },
  { id: "sales", label: "Sales", href: "/sales", icon: Handshake },
  { id: "marketing", label: "Marketing", href: "/marketing", icon: Megaphone },
  { id: "research", label: "Research & Development", href: "/research", icon: FlaskConical },
  { id: "operations", label: "Operations", href: "/operations", icon: Cog },
  { id: "finance", label: "Finance", href: "/finance", icon: Wallet },
  { id: "documents", label: "Documents", href: "/documents", icon: FileStack },
  { id: "knowledge", label: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { id: "training", label: "Training Center", href: "/training", icon: GraduationCap },
  { id: "customers", label: "Customers", href: "/customers", icon: Building2 },
  { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
  { id: "administration", label: "Administration", href: "/administration", icon: ShieldCheck },
];

/**
 * Workspace Sidebar — grouped sections per workspace.
 * "Each workspace has: Grouped navigation, Section headings" — never flatten.
 * Source: 05 Department Operating Systems/*, 11 UX System/design-system-teardown.md
 */
export interface SidebarPageItem {
  label: string;
  href: string;
}

export interface SidebarSection {
  /** Uppercase, non-clickable organizational label. Omit for an ungrouped top section. */
  label?: string;
  items: SidebarPageItem[];
}

/** Resolve which workspace a pathname belongs to, longest-prefix match. */
export function getWorkspaceIdFromPathname(pathname: string): WorkspaceId {
  if (pathname === "/") return "dashboard";
  const match = workspaces
    .filter((w) => w.href !== "/" && pathname.startsWith(w.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.id ?? "dashboard";
}

export const workspaceSidebars: Partial<Record<WorkspaceId, SidebarSection[]>> = {
  hr: [
    {
      label: "Workforce",
      items: [
        { label: "Employee Directory", href: "/hr/directory" },
        { label: "Employee Profiles", href: "/hr/profiles" },
        { label: "New Hire Onboarding", href: "/hr/onboarding" },
        { label: "Benefits", href: "/hr/benefits" },
      ],
    },
    {
      label: "Recruitment",
      items: [
        { label: "Applicants", href: "/hr/recruitment/applicants" },
        { label: "Interviews", href: "/hr/recruitment/interviews" },
        { label: "Job Listings", href: "/hr/recruitment/job-listings" },
        { label: "Careers Page", href: "/hr/recruitment/careers-page" },
      ],
    },
    {
      label: "Learning",
      items: [{ label: "Training", href: "/hr/training" }],
    },
    {
      label: "Performance",
      items: [{ label: "Performance Reviews", href: "/hr/performance" }],
    },
    {
      label: "Policies",
      items: [
        { label: "Employee Handbook", href: "/hr/handbook" },
        { label: "Policies", href: "/hr/policies" },
        { label: "Team Documents", href: "/hr/documents" },
      ],
    },
    {
      label: "Settings",
      items: [{ label: "Settings", href: "/hr/settings" }],
    },
  ],
  sales: [
    {
      items: [
        { label: "Leads", href: "/sales/leads" },
        { label: "Companies", href: "/sales/companies" },
        { label: "Contacts", href: "/sales/contacts" },
        { label: "Meetings", href: "/sales/meetings" },
        { label: "Playbooks", href: "/sales/playbooks" },
        { label: "Knowledge", href: "/sales/knowledge" },
        { label: "Reports", href: "/sales/reports" },
      ],
    },
  ],
  marketing: [
    {
      items: [
        { label: "Campaigns", href: "/marketing/campaigns" },
        { label: "Creative Library", href: "/marketing/creative-library" },
        { label: "Content Calendar", href: "/marketing/content-calendar" },
        { label: "Brand Assets", href: "/marketing/brand-assets" },
        { label: "Research", href: "/marketing/research" },
        { label: "Reports", href: "/marketing/reports" },
      ],
    },
  ],
  finance: [
    {
      items: [
        { label: "Revenue", href: "/finance/revenue" },
        { label: "Expenses", href: "/finance/expenses" },
        { label: "Runway", href: "/finance/runway" },
        { label: "Cash Flow", href: "/finance/cash-flow" },
        { label: "Budget Planning", href: "/finance/budget-planning" },
        { label: "Forecasting", href: "/finance/forecasting" },
        { label: "Invoices", href: "/finance/invoices" },
        { label: "Bills", href: "/finance/bills" },
        { label: "Banking", href: "/finance/banking" },
        { label: "Reports", href: "/finance/reports" },
      ],
    },
  ],
  operations: [
    {
      items: [
        { label: "SOPs", href: "/operations/sops" },
        { label: "Procurement", href: "/operations/procurement" },
        { label: "Vendors", href: "/operations/vendors" },
        { label: "Inventory", href: "/operations/inventory" },
        { label: "Compliance", href: "/operations/compliance" },
        { label: "Requests", href: "/operations/requests" },
        { label: "Audit Logs", href: "/operations/audit-logs" },
      ],
    },
  ],
  knowledge: [
    {
      items: [
        { label: "Handbooks", href: "/knowledge/handbooks" },
        { label: "SOPs", href: "/knowledge/sops" },
        { label: "Templates", href: "/knowledge/templates" },
        { label: "Meeting Notes", href: "/knowledge/meeting-notes" },
        { label: "Lessons Learned", href: "/knowledge/lessons-learned" },
        { label: "Best Practices", href: "/knowledge/best-practices" },
      ],
    },
  ],
  training: [
    {
      items: [
        { label: "Learning Paths", href: "/training/learning-paths" },
        { label: "Courses", href: "/training/courses" },
        { label: "Assessments", href: "/training/assessments" },
        { label: "Certifications", href: "/training/certifications" },
        { label: "Progress", href: "/training/progress" },
        { label: "Departmental Training", href: "/training/departmental" },
      ],
    },
  ],
};
