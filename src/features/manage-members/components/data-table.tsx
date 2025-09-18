"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
  IconPlus,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Eye,
  Mail,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

import { useInviteMemberModal } from "../hooks/use-invite-member-modal";
import { useUpdateMember } from "../api/use-update-member";
import { useRouter } from "next/navigation";
import { DeleteMemberModal } from "./delete-member-modal";

export const PermissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
});

// Tenant member context schema
export const schema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
  permissions: z.array(PermissionSchema),
  planId: z.string().uuid(),
  roleId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  tenantId: z.string().uuid(),
  joinedAt: z.date(),
  roleName: z.string(),
  currentMemberId: z.string(),
});

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0) || ""}${
    lastName?.charAt(0) || ""
  }`.toUpperCase();
};

// --- createColumns factory (place near top of file) ---
function createColumns(
  currentMemberId: string,
  tenantRoles: { id: string; roleName: string }[],
  router: any
): ColumnDef<z.infer<typeof schema>>[] {
  return [
    {
      accessorKey: "member",
      header: "Member",
      cell: ({ row }) => (
        <div className="w-56">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {getInitials(row.original.firstName, row.original.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {row.original.firstName} {row.original.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                ID: {row.original.id.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: () => <div className="w-full">Email</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          {row.original.email}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const { mutate, isPending } = useUpdateMember();
        const currentValue = row.original.roleId; // <-- role id already available

        return (
          <Select
            defaultValue={currentValue}
            onValueChange={(newRoleId) => {
              mutate({
                memberId: row.original.id,
                data: { roleId: newRoleId },
              });
            }}
          >
            <SelectTrigger
              value={currentValue}
              className="w-32"
              disabled={
                row.original.id === currentMemberId ||
                isPending ||
                row.original.roleName === "owner"
              }
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {tenantRoles.map((r) => (
                // value is role id, but the content is the roleName (what the user sees)
                <SelectItem
                  key={r.id}
                  value={r.id}
                  disabled={r.roleName === "owner"}
                >
                  {r.roleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? (
            <>
              <UserCheck className="w-3 h-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <UserX className="w-3 h-3 mr-1" />
              Inactive
            </>
          )}
        </Badge>
      ),
    },
    {
      accessorKey: "joinedAt",
      header: () => <div className="w-full">Joined At</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {new Date(row.original.joinedAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const [open, setOpen] = React.useState(false);
        const id = row.original.id;
        // use the currentMemberId captured by the factory
        return (
          <>
            <DeleteMemberModal
              isOpen={open}
              onClose={() => setOpen(false)}
              member={row.original}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/manage-members/${id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {currentMemberId !== id && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setOpen(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Member
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];
}

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({
  data: initialData,
}: {
  data: {
    members: z.infer<typeof schema>[];
    currentMemberId: string;
    tenantRoles: any[];
  };
}) {
  const router = useRouter();
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const { open } = useInviteMemberModal();

  const columns = React.useMemo(
    () => createColumns(data.currentMemberId, data.tenantRoles, router),
    [data.currentMemberId, data.tenantRoles, router]
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data.members?.map(({ id }) => id) || [],
    [data]
  );

  const table = useReactTable({
    data: data.members || [],
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-end px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={open}>
            <IconPlus />
            <span className="hidden lg:inline">Invite Member</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-end px-4">
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}
