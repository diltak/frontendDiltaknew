
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Filter, Search, Download, ChevronLeft, ChevronRight, Loader2, Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, FileDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: { label: string; value: string }[];
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface DataListProps<T> {
  title?: string;
  data?: T[];
  apiPath?: string;
  dataPath?: string;
  onDataLoaded?: (data: T[]) => void;
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  rowKey?: keyof T | ((row: T) => string);
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  onExport?: () => void;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  /** Show import button */
  is_import?: boolean;
  /** API endpoint to POST imported rows */
  create_api?: string;
  /** Called after successful import with the parsed rows */
  onImportSuccess?: (rows: Record<string, any>[]) => void;
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc') return <ChevronUp className="h-3.5 w-3.5 text-emerald-600" />;
  if (direction === 'desc') return <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />;
  return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-300" />;
}

// ─── Column filter dropdown ───────────────────────────────────────────────────

function ColumnFilter({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className={`p-0.5 rounded transition-colors ${value !== 'all' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
        aria-label="Filter column"
      >
        <Filter className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[140px] overflow-hidden">
            {[{ label: 'All', value: 'all' }, ...options].map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  value === opt.value
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Import Modal ─────────────────────────────────────────────────────────────

type ImportStep = 'idle' | 'uploading' | 'success' | 'error';

function ImportModal<T extends Record<string, any>>({
  open,
  onClose,
  columns,
  create_api,
  onImportSuccess,
}: {
  open: boolean;
  onClose: () => void;
  columns: ColumnDef<T>[];
  create_api?: string;
  onImportSuccess?: (rows: Record<string, any>[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<ImportStep>('idle');
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('idle');
        setFileName('');
        setErrorMsg('');
        setUploadedCount(0);
        setDragOver(false);
      }, 300);
    }
  }, [open]);

  // Build format headers from non-render-only columns
  const formatHeaders = columns.map(c => c.title).join(',');
  const formatSampleRow = columns.map(c => `Sample ${c.title}`).join(',');

  function downloadFormat() {
    const csv = `${formatHeaders}\n${formatSampleRow}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import_format.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function processFile(file: File) {
    if (!file) return;
    setFileName(file.name);
    setStep('uploading');
    setErrorMsg('');

    try {
      // Parse CSV/Excel via FileReader
      const text = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = e => res(e.target?.result as string);
        reader.onerror = () => rej(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) throw new Error('File has no data rows.');

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const rows: Record<string, any>[] = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj: Record<string, any> = {};
        headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
        return obj;
      });

      if (!create_api) {
        // No API — just surface parsed rows
        setUploadedCount(rows.length);
        setStep('success');
        onImportSuccess?.(rows);
        return;
      }

      // POST to create_api
      let token: string | null = null;
      try {
        token = localStorage.getItem('access_token');
        if (!token) {
          const { auth } = await import('@/lib/firebase');
          token = (await auth.currentUser?.getIdToken()) ?? null;
        }
      } catch { /* ignore auth errors */ }

      const res = await fetch(create_api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ rows }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.message ?? `Server error ${res.status}`);
      }

      setUploadedCount(rows.length);
      setStep('success');
      onImportSuccess?.(rows);
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Unknown error');
      setStep('error');
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Import Data</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Step 1 — Download Format */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">
                  Step 1 — Download Format
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get the CSV template with the correct column headers.
                </p>
              </div>
              <button
                onClick={downloadFormat}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-colors"
              >
                <FileDown className="h-5 w-5" />
                Download
              </button>
            </div>
          </div>

          {/* Step 2 — Upload File */}
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Step 2 — Upload Your File
            </p>

            {step === 'idle' || step === 'error' ? (
              <>
                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all py-8 flex flex-col items-center justify-center gap-2 ${
                    dragOver
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                      : step === 'error'
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {step === 'error' ? (
                    <AlertCircle className="h-7 w-7 text-red-400" />
                  ) : (
                    <Upload className={`h-7 w-7 ${dragOver ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`} />
                  )}
                  <div className="text-center">
                    <p className={`text-xs font-medium ${step === 'error' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {step === 'error' ? errorMsg : 'Drop your file here or click to browse'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                      {step === 'error' ? 'Click to try again' : 'Supports .csv, .xlsx, .xls'}
                    </p>
                  </div>
                </div>
              </>
            ) : step === 'uploading' ? (
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-5 flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Importing {fileName}…</p>
                  <p className="text-xs text-gray-400 mt-0.5">Please wait</p>
                </div>
              </div>
            ) : (
              /* Success */
              <div className="rounded-xl border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-5 flex flex-col items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <div className="text-center">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    Import successful
                  </p>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                    {uploadedCount} row{uploadedCount !== 1 ? 's' : ''} imported from <span className="font-medium">{fileName}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          {step === 'success' ? (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-sm text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm"
            >
              Create
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={step === 'uploading'}
                className="px-4 py-2 rounded-sm text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors shadow-sm"
              >
                {step === 'uploading' ? 'Importing…' : 'Browse File'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DataList ─────────────────────────────────────────────────────────────────

// Import ServerAddress for use in the component
import ServerAddress from '@/constent/ServerAddress';

export function DataList<T extends Record<string, any>>({
  title,
  data = [],
  apiPath,
  dataPath = 'employees',
  onDataLoaded,
  columns,
  searchPlaceholder = 'Search...',
  rowKey,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 25,
  onExport,
  toolbar,
  emptyMessage = 'No data found.',
  onRowClick,
  className = '',
  is_import = false,
  create_api,
  onImportSuccess,
}: DataListProps<T>) {
  const [internalData, setInternalData] = useState<T[]>(data);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Server-side pagination metadata from API response
  const [totalCount,  setTotalCount]  = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [hasNext,     setHasNext]     = useState(false);
  const [hasPrev,     setHasPrev]     = useState(false);

  // Debounce search so we don't fire a request on every keystroke
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 350);
  }

  // ── Fetch data from API (server-side pagination) ───────────────────────────
  useEffect(() => {
    if (!apiPath) {
      setInternalData(data);
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');

        // Build query params — always send page & limit so the API paginates
        const params: Record<string, string | number> = {
          page,
          limit: pageSize,
        };
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

        const response = await axios.get(apiPath, {
          params,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error('Failed to fetch data');
        const json = await res.json();

        let fetchedData: T[] = [];
        if (transformResponse) {
          fetchedData = transformResponse(resData);
        } else if (dataPath && resData[dataPath]) {
          fetchedData = resData[dataPath];
        } else if (Array.isArray(resData)) {
          fetchedData = resData;
        } else if (resData.success && resData.data) {
          fetchedData = resData.data;
        } else {
          const possibleArray = Object.values(json).find(Array.isArray);
          if (possibleArray) fetchedData = possibleArray as T[];
        }

        if (isMounted) {
          setInternalData(fetchedData);

          // Read server-side pagination metadata
          const total      = resData.total      ?? fetchedData.length;
          const tPages     = resData.totalPages  ?? Math.max(1, Math.ceil(total / pageSize));
          const apiHasNext = resData.hasNext     ?? page < tPages;
          const apiHasPrev = resData.hasPrev     ?? page > 1;

          setTotalCount(total);
          setTotalPages(tPages);
          setHasNext(apiHasNext);
          setHasPrev(apiHasPrev);

          onDataLoaded?.(fetchedData);
        }
      } catch (err: any) {
        if (isMounted) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  // Re-fetch whenever page, pageSize, or debounced search changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath, dataPath, transformResponse, page, pageSize, debouncedSearch]);

  const [globalSort, setGlobalSort] = useState('newest');
  const [globalSortOpen, setGlobalSortOpen] = useState(false);
  const [globalFilterOpen, setGlobalFilterOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('all');

  const filterableColumns = columns.filter(c => c.filterable && c.filterOptions?.length);
  const globalFilterOptions = filterableColumns[0]?.filterOptions ?? [];

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc');
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  function setColumnFilter(key: string, value: string) {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }

  // Client-side filtering/sorting applied on top of the current page's data
  const processed = useMemo(() => {
    let rows = [...internalData];

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(row =>
        columns.some(col => {
          const val = row[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    if (globalFilter !== 'all' && filterableColumns[0]) {
      const key = filterableColumns[0].key;
      rows = rows.filter(row => String(row[key]) === globalFilter);
    }

    Object.entries(columnFilters).forEach(([key, val]) => {
      if (val && val !== 'all') {
        rows = rows.filter(row => String(row[key]) === val);
      }
    });

    if (sortKey && sortDir) {
      rows.sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    } else if (globalSort === 'oldest') {
      rows.sort((a, b) => {
        const dateA = a.createdAt || a.created_at || 0;
        const dateB = b.createdAt || b.created_at || 0;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
    } else {
      rows.sort((a, b) => {
        const dateA = a.createdAt || a.created_at || 0;
        const dateB = b.createdAt || b.created_at || 0;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    }

    return rows;
  }, [internalData, globalFilter, columnFilters, sortKey, sortDir, globalSort, filterableColumns]);

  // When using API pagination the server already sliced the data — show it all
  // When using static data prop, slice client-side
  const paginated = apiPath ? processed : processed.slice((page - 1) * pageSize, page * pageSize);
  const clientTotalPages = apiPath ? totalPages : Math.max(1, Math.ceil(processed.length / pageSize));
  const clientHasNext    = apiPath ? hasNext    : page < clientTotalPages;
  const clientHasPrev    = apiPath ? hasPrev    : page > 1;
  const displayTotal     = apiPath ? totalCount : processed.length;
  const rangeStart       = (page - 1) * pageSize + 1;
  const rangeEnd         = apiPath
    ? Math.min(page * pageSize, totalCount)
    : Math.min(page * pageSize, processed.length);

  function getRowKey(row: T, i: number): string {
    if (!rowKey) return String(i);
    if (typeof rowKey === 'function') return rowKey(row);
    return String(row[rowKey]);
  }

  // After a successful import, reset to page 1 to trigger a fresh fetch
  const handleImportSuccess = (rows: Record<string, any>[]) => {
    setPage(1);
    setDebouncedSearch('');
    setSearch('');
    onImportSuccess?.(rows);
  };

  return (
    <>
      <div className={`flex flex-col ${className}`}>
        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-600 text-gray-800 dark:text-gray-200 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Global filter dropdown */}
            {globalFilterOptions.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setGlobalFilterOpen(o => !o)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {globalFilter === 'all' ? (filterableColumns[0]?.title ?? 'Filter') : globalFilterOptions.find(o => o.value === globalFilter)?.label ?? globalFilter}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {globalFilterOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setGlobalFilterOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[160px] overflow-hidden">
                      {[{ label: `All ${filterableColumns[0]?.title ?? ''}`, value: 'all' }, ...globalFilterOptions].map(opt => (
                        <button key={opt.value} onClick={() => { setGlobalFilter(opt.value); setGlobalFilterOpen(false); setPage(1); }}
                          className={`w-full text-left px-3 py-2.5 text-xs transition-colors ${globalFilter === opt.value ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setGlobalSortOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronsUpDown className="h-3.5 w-3.5" />
                {globalSort === 'newest' ? 'Newest First' : 'Oldest First'}
                <ChevronDown className="h-3 w-3" />
              </button>
              {globalSortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setGlobalSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[140px] overflow-hidden">
                    {[{ label: 'Newest First', value: 'newest' }, { label: 'Oldest First', value: 'oldest' }].map(opt => (
                      <button key={opt.value} onClick={() => { setGlobalSort(opt.value); setGlobalSortOpen(false); setPage(1); }}
                        className={`w-full text-left px-3 py-2.5 text-xs transition-colors ${globalSort === opt.value ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Export */}
            {onExport && (
              <button onClick={onExport}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                aria-label="Export">
                <Download className="h-5 w-5" />
              </button>
            )}

            {/* Import */}
            {is_import && (
              <button
                onClick={() => setImportModalOpen(true)}
                // className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-sm transition-colors"
              
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                aria-label="Export"
              >
                <Upload className="h-5 w-5" />
                {/* Import */}
              </button>
            )}

            {toolbar}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
                {columns.map(col => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={col.sortable ? 'cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors' : ''}
                        onClick={() => col.sortable && handleSort(col.key)}
                      >
                        {col.title}
                      </span>
                      {col.sortable && (
                        <span className="cursor-pointer" onClick={() => handleSort(col.key)}>
                          <SortIcon direction={sortKey === col.key ? sortDir : null} />
                        </span>
                      )}
                      {col.filterable && col.filterOptions?.length && (
                        <ColumnFilter
                          options={col.filterOptions}
                          value={columnFilters[col.key] ?? 'all'}
                          onChange={v => setColumnFilter(col.key, v)}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Loading data...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-gray-400">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr
                    key={getRowKey(row, i)}
                    onClick={() => onRowClick?.(row)}
                    className={`border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10' : 'hover:bg-gray-50/60 dark:hover:bg-gray-800/40'
                    }`}
                  >
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {col.render ? col.render(row[col.key], row, i) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, processed.length)} of {processed.length}</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <div className="flex items-center gap-1">
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="text-xs bg-transparent border-none outline-none cursor-pointer text-gray-500 dark:text-gray-400"
              >
                {pageSizeOptions.map(s => <option key={s} value={s}>{s} per page</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Import Modal ── */}
      <ImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        columns={columns}
        create_api={create_api}
        onImportSuccess={onImportSuccess}
      />
    </>
  );
}

export default DataList;


// 'use client';

// import { useState, useMemo, useEffect } from 'react';
// import { ChevronUp, ChevronDown, ChevronsUpDown, Filter, Search, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// // ─── Types ────────────────────────────────────────────────────────────────────

// export type SortDirection = 'asc' | 'desc' | null;

// export interface ColumnDef<T> {
//   key: string;
//   title: string;
//   sortable?: boolean;
//   filterable?: boolean;
//   filterOptions?: { label: string; value: string }[];
//   width?: string;
//   render?: (value: any, row: T, index: number) => React.ReactNode;
// }

// export interface DataListProps<T> {
//   title?: string;
//   data?: T[];
//   apiPath?: string;
//   dataPath?: string;
//   onDataLoaded?: (data: T[]) => void;
//   columns: ColumnDef<T>[];
//   /** Global search placeholder */
//   searchPlaceholder?: string;
//   /** Key to use for row identity */
//   rowKey?: keyof T | ((row: T) => string);
//   /** Rows per page options */
//   pageSizeOptions?: number[];
//   defaultPageSize?: number;
//   /** Show export button */
//   onExport?: () => void;
//   /** Extra toolbar content (right side) */
//   toolbar?: React.ReactNode;
//   /** Empty state message */
//   emptyMessage?: string;
//   /** Row click handler */
//   onRowClick?: (row: T) => void;
//   className?: string;
// }

// // ─── Sort icon ────────────────────────────────────────────────────────────────

// function SortIcon({ direction }: { direction: SortDirection }) {
//   if (direction === 'asc') return <ChevronUp className="h-3.5 w-3.5 text-emerald-600" />;
//   if (direction === 'desc') return <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />;
//   return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-300" />;
// }

// // ─── Column filter dropdown ───────────────────────────────────────────────────

// function ColumnFilter({
//   options,
//   value,
//   onChange,
// }: {
//   options: { label: string; value: string }[];
//   value: string;
//   onChange: (v: string) => void;
// }) {
//   const [open, setOpen] = useState(false);
//   return (
//     <div className="relative inline-block">
//       <button
//         onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
//         className={`p-0.5 rounded transition-colors ${value !== 'all' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
//         aria-label="Filter column"
//       >
//         <Filter className="h-3 w-3" />
//       </button>
//       {open && (
//         <>
//           <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
//           <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[140px] overflow-hidden">
//             {[{ label: 'All', value: 'all' }, ...options].map(opt => (
//               <button
//                 key={opt.value}
//                 onClick={() => { onChange(opt.value); setOpen(false); }}
//                 className={`w-full text-left px-3 py-2 text-xs transition-colors ${
//                   value === opt.value
//                     ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium'
//                     : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
//                 }`}
//               >
//                 {opt.label}
//               </button>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// // ─── DataList ─────────────────────────────────────────────────────────────────

// export function DataList<T extends Record<string, any>>({
//   title,
//   data = [],
//   apiPath,
//   dataPath,
//   onDataLoaded,
//   columns,
//   searchPlaceholder = 'Search...',
//   rowKey,
//   pageSizeOptions = [10, 25, 50, 100],
//   defaultPageSize = 25,
//   onExport,
//   toolbar,
//   emptyMessage = 'No data found.',
//   onRowClick,
//   className = '',
// }: DataListProps<T>) {
//   const [internalData, setInternalData] = useState<T[]>(data);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [search, setSearch] = useState('');
//   const [sortKey, setSortKey] = useState<string | null>(null);
//   const [sortDir, setSortDir] = useState<SortDirection>(null);
//   const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(defaultPageSize);

//   useEffect(() => {
//     if (!apiPath) {
//       setInternalData(data);
//       return;
//     }

//     let isMounted = true;
//     const fetchData = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         let token = localStorage.getItem('access_token');
//         if (!token) {
//           const { auth } = await import('@/lib/firebase');
//           token = await auth.currentUser?.getIdToken() || null;
//         }

//         const res = await fetch(apiPath, {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         });
        
//         if (!res.ok) throw new Error('Failed to fetch data');
//         const json = await res.json();
        
//         let fetchedData: T[] = [];
//         if (dataPath && json[dataPath]) {
//           fetchedData = json[dataPath];
//         } else if (Array.isArray(json)) {
//           fetchedData = json;
//         } else {
//           // generic fallback to find an array in the response
//           const possibleArray = Object.values(json).find(Array.isArray);
//           if (possibleArray) fetchedData = possibleArray as T[];
//         }
        
//         if (isMounted) {
//           setInternalData(fetchedData);
//           onDataLoaded?.(fetchedData);
//         }
//       } catch (err: any) {
//         if (isMounted) setError(err.message);
//       } finally {
//         if (isMounted) setIsLoading(false);
//       }
//     };
    
//     fetchData();
//     return () => { isMounted = false; };
//   }, [apiPath, dataPath]);

//   // Global sort dropdown
//   const [globalSort, setGlobalSort] = useState('newest');
//   const [globalSortOpen, setGlobalSortOpen] = useState(false);
//   const [globalFilterOpen, setGlobalFilterOpen] = useState(false);
//   const [globalFilter, setGlobalFilter] = useState('all');

//   const filterableColumns = columns.filter(c => c.filterable && c.filterOptions?.length);

//   // Derive global filter options from first filterable column with options
//   const globalFilterOptions = filterableColumns[0]?.filterOptions ?? [];

//   function handleSort(key: string) {
//     if (sortKey === key) {
//       setSortDir(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc');
//       if (sortDir === 'desc') setSortKey(null);
//     } else {
//       setSortKey(key);
//       setSortDir('asc');
//     }
//     setPage(1);
//   }

//   function setColumnFilter(key: string, value: string) {
//     setColumnFilters(prev => ({ ...prev, [key]: value }));
//     setPage(1);
//   }

//   const processed = useMemo(() => {
//     let rows = [...internalData];

//     // Global search
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       rows = rows.filter(row =>
//         columns.some(col => {
//           const val = row[col.key];
//           return val != null && String(val).toLowerCase().includes(q);
//         })
//       );
//     }

//     // Global filter (first filterable column)
//     if (globalFilter !== 'all' && filterableColumns[0]) {
//       const key = filterableColumns[0].key;
//       rows = rows.filter(row => String(row[key]) === globalFilter);
//     }

//     // Column-level filters
//     Object.entries(columnFilters).forEach(([key, val]) => {
//       if (val && val !== 'all') {
//         rows = rows.filter(row => String(row[key]) === val);
//       }
//     });

//     // Sort
//     if (sortKey && sortDir) {
//       rows.sort((a, b) => {
//         const av = a[sortKey], bv = b[sortKey];
//         if (av == null) return 1;
//         if (bv == null) return -1;
//         const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
//         return sortDir === 'asc' ? cmp : -cmp;
//       });
//     } else if (globalSort === 'oldest') {
//       rows.sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime());
//     } else {
//       rows.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
//     }

//     return rows;
//   }, [data, search, globalFilter, columnFilters, sortKey, sortDir, globalSort, columns, filterableColumns]);

//   const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
//   const paginated = processed.slice((page - 1) * pageSize, page * pageSize);

//   function getRowKey(row: T, i: number): string {
//     if (!rowKey) return String(i);
//     if (typeof rowKey === 'function') return rowKey(row);
//     return String(row[rowKey]);
//   }

//   return (
//     <div className={`flex flex-col ${className}`}>
//       {/* ── Toolbar ── */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
//         {/* Search */}
//         <div className="relative flex-1 min-w-0 max-w-xs">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//           <input
//             type="text"
//             value={search}
//             onChange={e => { setSearch(e.target.value); setPage(1); }}
//             placeholder={searchPlaceholder}
//             className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-600 text-gray-800 dark:text-gray-200 placeholder-gray-400"
//           />
//         </div>

//         <div className="flex items-center gap-2 ml-auto">
//           {/* Global filter dropdown */}
//           {globalFilterOptions.length > 0 && (
//             <div className="relative">
//               <button
//                 onClick={() => setGlobalFilterOpen(o => !o)}
//                 className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//               >
//                 <Filter className="h-3.5 w-3.5" />
//                 {globalFilter === 'all' ? (filterableColumns[0]?.title ?? 'Filter') : globalFilterOptions.find(o => o.value === globalFilter)?.label ?? globalFilter}
//                 <ChevronDown className="h-3 w-3" />
//               </button>
//               {globalFilterOpen && (
//                 <>
//                   <div className="fixed inset-0 z-40" onClick={() => setGlobalFilterOpen(false)} />
//                   <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[160px] overflow-hidden">
//                     {[{ label: `All ${filterableColumns[0]?.title ?? ''}`, value: 'all' }, ...globalFilterOptions].map(opt => (
//                       <button key={opt.value} onClick={() => { setGlobalFilter(opt.value); setGlobalFilterOpen(false); setPage(1); }}
//                         className={`w-full text-left px-3 py-2.5 text-xs transition-colors ${globalFilter === opt.value ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
//                         {opt.label}
//                       </button>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </div>
//           )}

//           {/* Sort dropdown */}
//           <div className="relative">
//             <button
//               onClick={() => setGlobalSortOpen(o => !o)}
//               className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//             >
//               <ChevronsUpDown className="h-3.5 w-3.5" />
//               {globalSort === 'newest' ? 'Newest First' : 'Oldest First'}
//               <ChevronDown className="h-3 w-3" />
//             </button>
//             {globalSortOpen && (
//               <>
//                 <div className="fixed inset-0 z-40" onClick={() => setGlobalSortOpen(false)} />
//                 <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[140px] overflow-hidden">
//                   {[{ label: 'Newest First', value: 'newest' }, { label: 'Oldest First', value: 'oldest' }].map(opt => (
//                     <button key={opt.value} onClick={() => { setGlobalSort(opt.value); setGlobalSortOpen(false); setPage(1); }}
//                       className={`w-full text-left px-3 py-2.5 text-xs transition-colors ${globalSort === opt.value ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
//                       {opt.label}
//                     </button>
//                   ))}
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Export */}
//           {onExport && (
//             <button onClick={onExport}
//               className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//               aria-label="Export">
//               <Download className="h-5 w-5" />
//             </button>
//           )}

//           {toolbar}
//         </div>
//       </div>

//       {/* ── Table ── */}
//       <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
//               {columns.map(col => (
//                 <th
//                   key={col.key}
//                   style={col.width ? { width: col.width } : undefined}
//                   className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap select-none"
//                 >
//                   <div className="flex items-center gap-1.5">
//                     <span
//                       className={col.sortable ? 'cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors' : ''}
//                       onClick={() => col.sortable && handleSort(col.key)}
//                     >
//                       {col.title}
//                     </span>
//                     {col.sortable && (
//                       <span className="cursor-pointer" onClick={() => handleSort(col.key)}>
//                         <SortIcon direction={sortKey === col.key ? sortDir : null} />
//                       </span>
//                     )}
//                     {col.filterable && col.filterOptions?.length && (
//                       <ColumnFilter
//                         options={col.filterOptions}
//                         value={columnFilters[col.key] ?? 'all'}
//                         onChange={v => setColumnFilter(col.key, v)}
//                       />
//                     )}
//                   </div>
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {isLoading ? (
//               <tr>
//                 <td colSpan={columns.length} className="px-4 py-12 text-center">
//                   <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" />
//                   <p className="mt-2 text-sm text-gray-500">Loading data...</p>
//                 </td>
//               </tr>
//             ) : error ? (
//               <tr>
//                 <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-red-500">
//                   {error}
//                 </td>
//               </tr>
//             ) : paginated.length === 0 ? (
//               <tr>
//                 <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-gray-400">
//                   {emptyMessage}
//                 </td>
//               </tr>
//             ) : (
//               paginated.map((row, i) => (
//                 <tr
//                   key={getRowKey(row, i)}
//                   onClick={() => onRowClick?.(row)}
//                   className={`border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors ${
//                     onRowClick ? 'cursor-pointer hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10' : 'hover:bg-gray-50/60 dark:hover:bg-gray-800/40'
//                   }`}
//                 >
//                   {columns.map(col => (
//                     <td key={col.key} className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
//                       {col.render ? col.render(row[col.key], row, i) : (row[col.key] ?? '—')}
//                     </td>
//                   ))}
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ── Pagination ── */}
//       <div className="flex items-center justify-between mt-3 px-1">
//         <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
//           <span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, processed.length)} of {processed.length}</span>
//           <span className="text-gray-300 dark:text-gray-600">|</span>
//           <div className="flex items-center gap-1">
//             <select
//               value={pageSize}
//               onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
//               className="text-xs bg-transparent border-none outline-none cursor-pointer text-gray-500 dark:text-gray-400"
//             >
//               {pageSizeOptions.map(s => <option key={s} value={s}>{s} per page</option>)}
//             </select>
//           </div>
//         </div>
//         <div className="flex items-center gap-1">
//           <button
//             onClick={() => setPage(p => Math.max(1, p - 1))}
//             disabled={page === 1}
//             className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//           >
//             <ChevronLeft className="h-3.5 w-3.5" />
//           </button>
//           <button
//             onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//             disabled={page === totalPages}
//             className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//           >
//             <ChevronRight className="h-3.5 w-3.5" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default DataList;
