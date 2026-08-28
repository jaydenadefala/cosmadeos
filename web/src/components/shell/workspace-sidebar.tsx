"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { workspaceSidebars, workspaces, type WorkspaceId } from "@/lib/navigation";

/**
 * Workspace Sidebar — grouped sections within the active workspace.
 * "Never flatten navigation." Section labels are uppercase, non-clickable
 * organizational headers; generic across every department — each workspace
 * supplies its own section data (see lib/navigation.ts), the component
 * itself never hardcodes a department.
 */
export function WorkspaceSidebar({ workspaceId }: { workspaceId: WorkspaceId }) {
  const pathname = usePathname();
  const sections = workspaceSidebars[workspaceId];
  const workspace = workspaces.find((w) => w.id === workspaceId);

  if (!sections || !workspace) return null;

  return (
    <Sidebar collapsible="icon" className="top-14 h-[calc(100svh-3.5rem)]">
      <SidebarContent>
        {sections.map((section, index) => (
          <SidebarGroup key={section.label ?? `section-${index}`}>
            {section.label ? (
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
