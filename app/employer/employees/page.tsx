'use client';

import { useState, useCallback } from 'react';
import { UserPlus, Eye, Users, CheckCircle, ShieldCheck, Briefcase, Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { withAuth } from '@/components/auth/with-auth';
import { DataList, type ColumnDef } from '@/components/list/DataList';
import { BrandLoader } from '@/components/loader';
import Link from 'next/link';
import ServerAddress from '@/constent/ServerAddress';

// ── types ──────────────────────────────────────────────────────────────────────

interface Employee {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  isActive?: boolean;
  createdAt?: string;
  id?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  created_at?: string;
}

// ── Delete Confirmation Modal ──────────────────────────────────────────────────

function DeleteConfirmModal({
  employee,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  employee: Employee;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  const fname = employee.firstName || employee.first_name || '';
  const lname = employee.lastName || employee.last_name || '';
  const fullName = `${fname} ${lname}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!isDeleting ? onCancel : undefined} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Delete Employee</h2>
          </div>
          {!isDeleting && (
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">{fullName}</span>?
            This action cannot be undone.
          </p>
          {employee.email && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{employee.email}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors shadow-sm"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Employees Page ─────────────────────────────────────────────────────────────

function EmployeesPage() {
  const { user, loading: userLoading } = useUser();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (employee: Employee) => {
    setDeleteTarget(employee);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const uid = deleteTarget.uid || deleteTarget.id;
    if (!uid) return;

    setIsDeleting(true);
    try {
      let token: string | null = null;
      try {
        token = localStorage.getItem('access_token');
        if (!token) {
          const { auth } = await import('@/lib/firebase');
          token = (await auth.currentUser?.getIdToken()) ?? null;
        }
      } catch { /* ignore auth errors */ }

      const res = await fetch(`${ServerAddress}/api/employees/${uid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.message ?? `Server error ${res.status}`);
      }

      // Refresh table
      setRefreshKey(prev => prev + 1);
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message ?? 'Failed to delete employee.');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchEmployees = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // ── Column definitions ───────────────────────────────────────────────────────

  const columns: ColumnDef<Employee>[] = [
    {
      key: "name",
      title: "Name",
      sortable: true,
      render: (_, row) => {
        const fname = row.firstName || row.first_name || "";
        const lname = row.lastName || row.last_name || "";
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 border border-emerald-200/50 dark:border-emerald-800/30">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {fname[0]}
                {lname[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                {fname} {lname}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                {row.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      title: "Role",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "Employee", value: "employee" },
        { label: "Manager", value: "manager" },
        { label: "HR", value: "hr" },
        { label: "Admin", value: "admin" },
      ],
      render: (val) => (
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
          val === 'manager' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
          val === 'hr' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }`}>{val}</span>
      ),
    },
    {
      key: "department",
      title: "Department",
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <Briefcase className="h-3 w-3 opacity-40" />
          <span className="text-xs">{val || "Unassigned"}</span>
        </div>
      ),
    },
    {
      key: "isActive",
      title: "Status",
      filterable: true,
      filterOptions: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
      render: (_, row) => {
        const isActive = row.isActive !== undefined ? row.isActive : row.is_active;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(row, isActive ? "deactivate" : "reactivate");
            }}
            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-80 ${
              isActive !== false ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive !== false 
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                  : "bg-gray-400"
              }`}
            />
            {isActive !== false ? "Active" : "Inactive"}
          </button>
        );
      },
    },
    {
      key: 'uid',
      title: 'Action',
      width: '80px',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/employer/employees/${row.uid || row.id}`}
            className="p-2 rounded-xl text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all inline-flex items-center justify-center border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30"
          >
            <Eye className="h-5 w-5" />
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all inline-flex items-center justify-center border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
            aria-label="Delete employee"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  if (userLoading) return <BrandLoader />;
  const router = useRouter();

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-6 py-6 max-w-[1400px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="h-6 w-6 text-emerald-500" />
              Employees
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your team, roles, and access permissions.
            </p>
          </div>
          <Link href="/employer/employees/add">
            <button className="flex items-center justify-center gap-2 px-6 h-11 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-md shadow-emerald-500/10 active:scale-95">
              <UserPlus className="h-5 w-5" />
              Add Employee
            </button>
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Members', value: employees.length, color: 'text-gray-800 dark:text-gray-100', icon: Users, bg: 'bg-gray-50 dark:bg-gray-900' },
            { label: 'Active Now', value: employees.filter(e => (e.isActive !== false && e.is_active !== false)).length, color: 'text-emerald-600', icon: CheckCircle, bg: 'bg-emerald-50/50 dark:bg-emerald-900/10' },
            { label: 'Managers', value: employees.filter(e => e.role === 'manager').length, color: 'text-blue-600', icon: ShieldCheck, bg: 'bg-blue-50/50 dark:bg-blue-900/10' },
            { label: 'Departments', value: Array.from(new Set(employees.map(e => e.department).filter(Boolean))).length, color: 'text-purple-600', icon: Briefcase, bg: 'bg-purple-50/50 dark:bg-purple-900/10' },
          ].map(s => (
            <div key={s.label} className={`flex flex-col items-center justify-center p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color} opacity-80 mb-2`} />
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 text-center">{s.label}</p>
            </div>
          ))}
        </div>

        {/* DataList */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <DataList<Employee>
            key={refreshKey}
            apiPath={`${ServerAddress}/employees`}
            dataPath="employees"
            onDataLoaded={(data) => setEmployees(data)}
            columns={columns}
            rowKey={(row) => row.uid || row.id || row.email}
            searchPlaceholder="Search by name, email, department or position..."
            defaultPageSize={25}
            emptyMessage="No employees found. Start by adding your first team member."
            onExport={() => {
              const csv = [
                ['Name', 'Email', 'Role', 'Department', 'Position', 'Status'],
                ...employees.map(e => [
                  `${e.firstName || e.first_name} ${e.lastName || e.last_name}`,
                  e.email, e.role,
                  e.department ?? '',
                  e.position ?? '',
                  (e.isActive !== false && e.is_active !== false) ? 'Active' : 'Inactive',
                ]),
              ].map(r => r.join(',')).join('\n');
              const a = document.createElement('a');
              a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
              a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
            is_import={true}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          employee={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !isDeleting && setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}

export default withAuth(EmployeesPage, ['employer', 'hr', 'admin']);

// 'use client';

// import { useState, useCallback } from 'react';
// import { motion } from 'framer-motion';
// import { UserPlus, Eye, Users, CheckCircle, ShieldCheck, Briefcase } from 'lucide-react';
// import { useUser } from '@/hooks/use-user';
// import { withAuth } from '@/components/auth/with-auth';
// import { DataList, type ColumnDef } from '@/components/list/DataList';
// import { BrandLoader } from '@/components/loader';
// import Link from 'next/link';
// import ServerAddress from '@/constent/ServerAddress';

// // ── types ──────────────────────────────────────────────────────────────────────

// interface Employee {
//   uid: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   role: string;
//   department?: string;
//   position?: string;
//   isActive?: boolean;
//   createdAt?: string;

//   id?: string;
//   first_name?: string;
//   last_name?: string;
//   is_active?: boolean;
//   created_at?: string;
// }

 
// // ── Employees Page ─────────────────────────────────────────────────────────────

// function EmployeesPage() {
//   const { user, loading: userLoading } = useUser();
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [refreshKey, setRefreshKey] = useState(0);

//   const fetchEmployees = useCallback(() => {
//     setRefreshKey(prev => prev + 1);
//   }, []);

//   // ── Column definitions ───────────────────────────────────────────────────────

//   const columns: ColumnDef<Employee>[] = [
//     {
//       key: 'name',
//       title: 'Name',
//       sortable: true,
//       render: (_, row) => {
//         const fname = row.firstName || row.first_name || '';
//         const lname = row.lastName || row.last_name || '';
//         return (
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 border border-emerald-200/50 dark:border-emerald-800/30">
//               <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
//                 {fname[0]}{lname[0]}
//               </span>
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
//                 {fname} {lname}
//               </p>
//               <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{row.email}</p>
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       key: 'role',
//       title: 'Role',
//       sortable: true,
//       filterable: true,
//       filterOptions: [
//         { label: 'Employee', value: 'employee' },
//         { label: 'Manager', value: 'manager' },
//         { label: 'HR', value: 'hr' },
//       ],
//       render: (val) => (
//         <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${val === 'manager' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
//             val === 'hr' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
//               'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
//           }`}>{val}</span>
//       ),
//     },
//     {
//       key: 'department',
//       title: 'Department',
//       sortable: true,
//       render: (val) => (
//         <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
//           <Briefcase className="h-3 w-3 opacity-40" />
//           <span className="text-xs">{val || 'Unassigned'}</span>
//         </div>
//       ),
//     },
//     {
//       key: 'isActive',
//       title: 'Status',
//       filterable: true,
//       filterOptions: [
//         { label: 'Active', value: 'true' },
//         { label: 'Inactive', value: 'false' },
//       ],
//       render: (_, row) => {
//         const val = row.isActive !== undefined ? row.isActive : row.is_active;
//         return (
//           <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${val !== false ? 'text-emerald-600' : 'text-gray-400'}`}>
//             <span className={`w-1.5 h-1.5 rounded-full ${val !== false ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-400'}`} />
//             {val !== false ? 'Active' : 'Inactive'}
//           </span>
//         );
//       },
//     },
//     {
//       key: 'uid',
//       title: '',
//       width: '60px',
//       render: (_, row) => (
//         <Link
//           href={`/employer/employees/${row.uid || row.id}`}
//           className="p-2 rounded-xl text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all inline-flex items-center justify-center border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30"
//         >
//           <Eye className="h-5 w-5" />
//         </Link>
//       ),
//     },
//   ];

//   if (userLoading) return <BrandLoader />;

//   return (
//     <div className="px-4 sm:px-6 lg:px-6 py-6 max-w-[1400px] mx-auto space-y-6">

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
//             <Users className="h-6 w-6 text-emerald-500" />
//             Employees
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//             Manage your team, roles, and access permissions.
//           </p>
//         </div>
//         <Link href="/employer/employees/add">
//           <button className="flex items-center justify-center gap-2 px-6 h-11 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-md shadow-emerald-500/10 active:scale-95">
//             <UserPlus className="h-5 w-5" />
//             Add Employee
//           </button>
//         </Link>
//       </div>

//       {/* Summary cards */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//         {[
//           { label: 'Total Members', value: employees.length, color: 'text-gray-800 dark:text-gray-100', icon: Users, bg: 'bg-gray-50 dark:bg-gray-900' },
//           { label: 'Active Now', value: employees.filter(e => (e.isActive !== false && e.is_active !== false)).length, color: 'text-emerald-600', icon: CheckCircle, bg: 'bg-emerald-50/50 dark:bg-emerald-900/10' },
//           { label: 'Managers', value: employees.filter(e => e.role === 'manager').length, color: 'text-blue-600', icon: ShieldCheck, bg: 'bg-blue-50/50 dark:bg-blue-900/10' },
//           { label: 'Departments', value: Array.from(new Set(employees.map(e => e.department).filter(Boolean))).length, color: 'text-purple-600', icon: Briefcase, bg: 'bg-purple-50/50 dark:bg-purple-900/10' },
//         ].map(s => (
//           <div key={s.label} className={`flex flex-col items-center justify-center p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm ${s.bg}`}>
//             <s.icon className={`h-5 w-5 ${s.color} opacity-80 mb-2`} />
//             <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
//             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 text-center">{s.label}</p>
//           </div>
//         ))}
//       </div>

//       {/* DataList */}
//       <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
//         <DataList<Employee>
//           key={refreshKey}
//           apiPath={`${ServerAddress}/employees`}
//           dataPath="employees"
//           onDataLoaded={(data) => setEmployees(data)}
//           columns={columns}
//           rowKey={(row) => row.uid || row.id || row.email}
//           searchPlaceholder="Search by name, email, department or position..."
//           defaultPageSize={25}
//           emptyMessage="No employees found. Start by adding your first team member."
//           onExport={() => {
//             const csv = [
//               ['Name', 'Email', 'Role', 'Department', 'Position', 'Status'],
//               ...employees.map(e => [
//                 `${e.firstName || e.first_name} ${e.lastName || e.last_name}`,
//                 e.email, e.role,
//                 e.department ?? '',
//                 e.position ?? '',
//                 (e.isActive !== false && e.is_active !== false) ? 'Active' : 'Inactive',
//               ]),
//             ].map(r => r.join(',')).join('\n');
//             const a = document.createElement('a');
//             a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
//             a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
//             a.click();
//           }}
//           is_import={true}
//         />
//       </div>
//     </div>
//   );
// }

// export default withAuth(EmployeesPage, ['employer', 'hr', 'admin']);
