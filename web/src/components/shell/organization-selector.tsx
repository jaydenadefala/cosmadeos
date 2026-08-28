"use client";

import { Check, ChevronsUpDown, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { availableCompanies } from "@/lib/mock-session";
import { useDevPreview } from "@/components/shell/dev-preview-context";

/**
 * Organization Selector (shell) — 06 Platform Core/app-shell.md names this
 * as an App Shell component; previously Not Started as a real, always-
 * visible surface (only the Developer Preview Toolbar's dev-mode-only
 * Company field existed). Shares the same underlying organization/company
 * state as that toolbar's Company field rather than duplicating it — the
 * app-shell doc treats "Organization selector" and "Company Switcher" as
 * the same multi-tenancy concept ("Organization/Company Switcher implies
 * multi-tenancy"), so switching here and switching there stay in sync.
 */
export function OrganizationSelector() {
  const { company, setCompany } = useDevPreview();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-8 max-w-[10rem] shrink-0 gap-1.5 px-2 text-sm font-medium sm:max-w-[12rem]"
          />
        }
      >
        <Building2 className="text-muted-foreground size-3.5 shrink-0" />
        <span className="truncate">{company}</span>
        <ChevronsUpDown className="text-muted-foreground size-3 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal uppercase tracking-wide">
          Switch organization
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableCompanies.map((c) => (
          <DropdownMenuItem key={c} onClick={() => setCompany(c)}>
            <span className="flex-1">{c}</span>
            {c === company ? <Check className="size-3.5" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
