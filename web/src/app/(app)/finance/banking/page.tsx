"use client";

import * as React from "react";
import { toast } from "sonner";
import { Building2, MoreHorizontal, Plus, Trash2 } from "lucide-react";

import {
  AdvancedFilter,
  ActiveFilterChips,
  FilterTriggerButton,
  countActiveFilters,
  type FilterFieldConfig,
} from "@/components/ui/advanced-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/ui/metric-card";
import { PageToolbar, type Density } from "@/components/ui/page-toolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { SavedViewsMenu } from "@/components/ui/saved-views-menu";
import { useColumnVisibility } from "@/lib/use-column-visibility";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  addBankAccount,
  addTransaction,
  categorizeTransaction,
  deleteTransaction,
  TRANSACTION_CATEGORIES,
  useBankAccounts,
  useTransactions,
} from "@/lib/mock-data/banking";

/** Banking — Finance sidebar (05 Department Operating Systems/Finance/finance-operating-system.md). */
export default function BankingPage() {
  const accounts = useBankAccounts();
  const allTransactions = useTransactions();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [addAccountOpen, setAddAccountOpen] = React.useState(false);
  const [addTxnOpen, setAddTxnOpen] = React.useState(false);
  const [accountForm, setAccountForm] = React.useState({
    name: "",
    bankName: "",
    accountType: "Checking" as "Checking" | "Savings",
    balance: "",
  });
  const [txnForm, setTxnForm] = React.useState({ accountId: "", description: "", amount: "", date: "" });
  const columnVisibility = useColumnVisibility([
    { id: "account", label: "Account" },
    { id: "category", label: "Category" },
    { id: "date", label: "Date" },
  ]);

  const activeAccounts = React.useMemo(() => accounts.filter((a) => !a.archived), [accounts]);
  const transactions = React.useMemo(() => allTransactions.filter((t) => !t.archived), [allTransactions]);
  const totalBalance = activeAccounts.reduce((sum, a) => sum + a.balance, 0);

  const accountById = React.useMemo(() => {
    const map = new Map<string, (typeof accounts)[number]>();
    for (const account of accounts) map.set(account.id, account);
    return map;
  }, [accounts]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      {
        id: "category",
        label: "Category",
        options: TRANSACTION_CATEGORIES.map((c) => ({ value: c, label: c })),
      },
      {
        id: "accountId",
        label: "Account",
        options: activeAccounts.map((a) => ({ value: a.id, label: a.name })),
      },
    ],
    [activeAccounts],
  );

  const filtered = React.useMemo(() => {
    let rows = transactions;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((t) => t.description.toLowerCase().includes(q));
    }
    if (filters.category) rows = rows.filter((t) => t.category === filters.category);
    if (filters.accountId) rows = rows.filter((t) => t.accountId === filters.accountId);
    return [...rows].sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, search, filters]);

  const pagination = usePagination(filtered);

  function handleAddAccount() {
    if (!accountForm.name.trim() || !accountForm.bankName.trim()) {
      toast.error("Enter an account name and bank name.");
      return;
    }
    addBankAccount({
      name: accountForm.name.trim(),
      bankName: accountForm.bankName.trim(),
      accountType: accountForm.accountType,
      balance: Number(accountForm.balance) || 0,
    });
    toast.success(`${accountForm.name} added.`);
    setAddAccountOpen(false);
    setAccountForm({ name: "", bankName: "", accountType: "Checking", balance: "" });
  }

  function handleAddTransaction() {
    if (!txnForm.accountId || !txnForm.description.trim() || !txnForm.date) {
      toast.error("Choose an account, description, and date.");
      return;
    }
    addTransaction({
      accountId: txnForm.accountId,
      description: txnForm.description.trim(),
      amount: Number(txnForm.amount) || 0,
      date: txnForm.date,
    });
    toast.success("Transaction added.");
    setAddTxnOpen(false);
    setTxnForm({ accountId: "", description: "", amount: "", date: "" });
  }

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.filters && typeof snapshot.filters === "object") {
      setFilters(snapshot.filters as Record<string, string | undefined>);
    }
    if (snapshot.density === "comfortable" || snapshot.density === "compact" || snapshot.density === "dense") {
      setDensity(snapshot.density);
    }
    if (Array.isArray(snapshot.hiddenColumns)) {
      columnVisibility.setHiddenIds(snapshot.hiddenColumns as string[]);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold">Banking</h1>
          <p className="text-muted-foreground text-sm">Bank accounts and transaction history</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setAddAccountOpen(true)}>
          <Plus className="size-3.5" />
          Add Account
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-6">
        <MetricCard label="Total Balance" value={`$${totalBalance.toLocaleString()}`} icon={Building2} />
        {activeAccounts.map((account) => (
          <MetricCard key={account.id} label={`${account.name} (${account.bankName})`} value={`$${account.balance.toLocaleString()}`} />
        ))}
      </div>

      <div className="border-t px-4 pt-4 sm:px-6">
        <h2 className="mb-2 text-sm font-semibold">Transactions</h2>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search transactions…"
        filters={
          <AdvancedFilter
            trigger={<FilterTriggerButton count={countActiveFilters(filters)} />}
            fields={filterFields}
            values={filters}
            onChange={setFilters}
          />
        }
        savedViewsControl={
          <SavedViewsMenu
            pageKey="finance-banking"
            snapshot={{ search, filters, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onCreate={() => setAddTxnOpen(true)}
        createLabel="Add Transaction"
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1">
        {transactions.length === 0 ? (
          <EmptyState title="No transactions yet" description="Add a transaction to start tracking cash movement." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No transactions match your search"
            description="Try a different name or clear your filters."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setFilters({});
                }}
              >
                Clear search and filters
              </Button>
            }
          />
        ) : (
          <div className="p-4 sm:p-6">
            <Table density={density}>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  {columnVisibility.isVisible("account") ? <TableHead>Account</TableHead> : null}
                  {columnVisibility.isVisible("category") ? <TableHead>Category</TableHead> : null}
                  {columnVisibility.isVisible("date") ? <TableHead>Date</TableHead> : null}
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">{txn.description}</TableCell>
                    {columnVisibility.isVisible("account") ? (
                      <TableCell>{accountById.get(txn.accountId)?.name ?? "—"}</TableCell>
                    ) : null}
                    {columnVisibility.isVisible("category") ? (
                      <TableCell>
                        <Badge
                          variant={txn.category === "Uncategorized" ? "outline" : "secondary"}
                          className="font-normal"
                        >
                          {txn.category}
                        </Badge>
                      </TableCell>
                    ) : null}
                    {columnVisibility.isVisible("date") ? <TableCell>{txn.date}</TableCell> : null}
                    <TableCell className={txn.amount < 0 ? "text-destructive" : "text-emerald-700 dark:text-emerald-400"}>
                      {txn.amount < 0 ? "-" : "+"}${Math.abs(txn.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${txn.description}`} />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {TRANSACTION_CATEGORIES.filter((c) => c !== txn.category).map((category) => (
                            <DropdownMenuItem
                              key={category}
                              onClick={() => {
                                categorizeTransaction(txn.id, category);
                                toast.success(`Categorized as ${category}.`);
                              }}
                            >
                              Categorize as {category}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              deleteTransaction(txn.id);
                              toast.success("Transaction deleted.");
                            }}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
        itemLabel="transactions"
      />

      <Dialog open={addAccountOpen} onOpenChange={setAddAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add bank account</DialogTitle>
            <DialogDescription>Track a new checking or savings account.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="account-name" label="Account name">
              <Input
                id="account-name"
                value={accountForm.name}
                onChange={(e) => setAccountForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field id="account-bank" label="Bank name">
              <Input
                id="account-bank"
                value={accountForm.bankName}
                onChange={(e) => setAccountForm((f) => ({ ...f, bankName: e.target.value }))}
              />
            </Field>
            <Field id="account-type" label="Account type">
              <Select
                value={accountForm.accountType}
                onValueChange={(value) =>
                  value && setAccountForm((f) => ({ ...f, accountType: value as "Checking" | "Savings" }))
                }
              >
                <SelectTrigger id="account-type" className="w-full">
                  <SelectValue>{(value: string) => value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Checking">Checking</SelectItem>
                  <SelectItem value="Savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field id="account-balance" label="Starting balance (₦)">
              <Input
                id="account-balance"
                type="number"
                value={accountForm.balance}
                onChange={(e) => setAccountForm((f) => ({ ...f, balance: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleAddAccount}>Add account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addTxnOpen} onOpenChange={setAddTxnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add transaction</DialogTitle>
            <DialogDescription>Positive amounts are inflows, negative are outflows.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="txn-account" label="Account">
              <Select
                value={txnForm.accountId}
                onValueChange={(value) => value && setTxnForm((f) => ({ ...f, accountId: value }))}
              >
                <SelectTrigger id="txn-account" className="w-full">
                  <SelectValue>
                    {(value: string) => accountById.get(value)?.name ?? "Select an account…"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="txn-description" label="Description">
              <Input
                id="txn-description"
                value={txnForm.description}
                onChange={(e) => setTxnForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Field>
            <Field id="txn-amount" label="Amount (₦, negative for outflow)">
              <Input
                id="txn-amount"
                type="number"
                value={txnForm.amount}
                onChange={(e) => setTxnForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </Field>
            <Field id="txn-date" label="Date">
              <Input
                id="txn-date"
                type="date"
                value={txnForm.date}
                onChange={(e) => setTxnForm((f) => ({ ...f, date: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleAddTransaction}>Add transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
