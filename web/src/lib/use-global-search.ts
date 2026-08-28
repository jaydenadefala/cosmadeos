"use client";

import * as React from "react";
import {
  Users,
  Building2,
  Contact as ContactIcon,
  Receipt,
  Megaphone,
  BookOpen,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { useEmployees } from "@/lib/mock-data/employees";
import { useCompanies } from "@/lib/mock-data/companies";
import { useContacts } from "@/lib/mock-data/contacts";
import { useInvoices } from "@/lib/mock-data/invoices";
import { useCampaigns } from "@/lib/mock-data/campaigns";
import { useKnowledgeArticles } from "@/lib/mock-data/knowledge-articles";
import { useVendors } from "@/lib/mock-data/vendors";

/**
 * Global search experience (shell) — 06 Platform Core/app-shell.md,
 * global-command-palette.md: "Single overlay input with typeahead results
 * across all searchable object types (Employees, Hospitals, Invoices,
 * Projects, Products, Research, Documents, Workflows, Knowledge)."
 * Wires real typeahead across the object types that exist in this build
 * (the doc's list names objects — Hospitals, Projects — that don't have a
 * built entity yet; extended here to the equivalent built types instead).
 */
export interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  group: string;
  icon: LucideIcon;
}

export function useGlobalSearchResults(query: string): SearchResult[] {
  const employees = useEmployees();
  const companies = useCompanies();
  const contacts = useContacts();
  const invoices = useInvoices();
  const campaigns = useCampaigns();
  const articles = useKnowledgeArticles();
  const vendors = useVendors();

  return React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResult[] = [];

    for (const e of employees) {
      if (e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)) {
        results.push({
          id: `employee-${e.id}`,
          label: e.name,
          sublabel: "Employee",
          href: `/hr/directory/${e.id}`,
          group: "Employees",
          icon: Users,
        });
      }
    }
    for (const c of companies) {
      if (c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)) {
        results.push({
          id: `company-${c.id}`,
          label: c.name,
          sublabel: c.industry,
          href: `/sales/companies/${c.id}`,
          group: "Companies",
          icon: Building2,
        });
      }
    }
    for (const c of contacts) {
      if (c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)) {
        results.push({
          id: `contact-${c.id}`,
          label: c.name,
          sublabel: c.title,
          href: `/sales/contacts/${c.id}`,
          group: "Contacts",
          icon: ContactIcon,
        });
      }
    }
    for (const i of invoices) {
      if (i.invoiceNumber.toLowerCase().includes(q)) {
        results.push({
          id: `invoice-${i.id}`,
          label: i.invoiceNumber,
          sublabel: i.status,
          href: `/finance/invoices/${i.id}`,
          group: "Invoices",
          icon: Receipt,
        });
      }
    }
    for (const c of campaigns) {
      if (c.name.toLowerCase().includes(q) || c.objective.toLowerCase().includes(q)) {
        results.push({
          id: `campaign-${c.id}`,
          label: c.name,
          sublabel: c.status,
          href: `/marketing/campaigns/${c.id}`,
          group: "Campaigns",
          icon: Megaphone,
        });
      }
    }
    for (const a of articles) {
      if (a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)) {
        results.push({
          id: `article-${a.id}`,
          label: a.title,
          sublabel: a.category,
          href: `/knowledge/articles/${a.id}`,
          group: "Knowledge",
          icon: BookOpen,
        });
      }
    }
    for (const v of vendors) {
      if (v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q)) {
        results.push({
          id: `vendor-${v.id}`,
          label: v.name,
          sublabel: v.category,
          href: `/operations/vendors/${v.id}`,
          group: "Vendors",
          icon: Truck,
        });
      }
    }

    return results.slice(0, 30);
  }, [query, employees, companies, contacts, invoices, campaigns, articles, vendors]);
}
