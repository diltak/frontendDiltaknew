"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Trash2,
  Upload,
  UploadCloud,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { axiosInstance } from "@/lib/api-client";
import ServerAddress from "@/constent/ServerAddress";
import type {
  MedicalDocumentDetail,
  MedicalReportType,
  UrgencyLevel,
} from "@/types/physical-health";

const REPORT_TYPES: { value: MedicalReportType; label: string }[] = [
  { value: "lab_work", label: "Lab work" },
  { value: "blood_test", label: "Blood test" },
  { value: "xray_mri", label: "X-ray / MRI" },
  { value: "prescription", label: "Prescription" },
  { value: "general_checkup", label: "General checkup" },
  { value: "specialist", label: "Specialist" },
  { value: "other", label: "Other" },
];

const ALLOWED_MEDICAL_EXTENSIONS = [".pdf", ".docx", ".doc"];
const MAX_MEDICAL_FILE_BYTES = 100 * 1024 * 1024; // 10MB

const STATUS_STYLES: Record<string, string> = {
  uploaded:
    "bg-info/10 text-info border-info/20",
  processing:
    "bg-warning/10 text-warning border-warning/20",
  analyzed:
    "bg-success/10 text-success border-success/20",
  failed:
    "bg-destructive/10 text-destructive border-destructive/20",
};

const URGENCY_STYLES: Record<string, string> = {
  routine:
    "bg-muted text-muted-foreground",
  follow_up:
    "bg-info/10 text-info",
  urgent:
    "bg-warning/10 text-warning",
  emergency:
    "bg-destructive/10 text-destructive",
};

const FLAG_STATUS_STYLES: Record<string, string> = {
  normal:
    "bg-success/10 text-success",
  borderline:
    "bg-warning/10 text-warning",
  low: "bg-info/10 text-info",
  high: "bg-destructive/10 text-destructive",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function MedicalDocsTab() {
  const [docs, setDocs] = useState<MedicalDocumentDetail[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState<MedicalReportType>("lab_work");
  const [reportDate, setReportDate] = useState("");
  const [facility, setFacility] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<
    Record<string, MedicalDocumentDetail>
  >({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Ref for the hidden file input — needed for production-safe click trigger
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollersRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await axiosInstance.get(
        `${ServerAddress}/physical-health/medical`,
      );
      if (response.data.success) {
        setDocs(response.data.documents || []);
      } else {
        throw new Error("Failed to load documents");
      }
    } catch (e) {
      toast({
        title: "Could not load documents",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const stopPoller = (docId: string) => {
    const h = pollersRef.current[docId];
    if (h) {
      clearInterval(h);
      delete pollersRef.current[docId];
    }
  };

  const getDocumentStatus = async (docId: string) => {
    const response = await axiosInstance.get(
      `${ServerAddress}/physical-health/medical/${docId}/status`,
    );
    return response.data;
  };

  const getDocumentDetail = async (docId: string) => {
    const response = await axiosInstance.get(
      `${ServerAddress}/physical-health/medical/${docId}`,
    );
    return response.data;
  };

  const startPoller = useCallback((docId: string) => {
    if (pollersRef.current[docId]) return;
    let elapsed = 0;
    const handle = setInterval(async () => {
      elapsed += 3000;
      try {
        const status = await getDocumentStatus(docId);
        if (status.status === "analyzed" || status.status === "failed") {
          stopPoller(docId);
          try {
            const detail = await getDocumentDetail(docId);
            setDocs((prev) =>
              prev.map((d) => (d.doc_id === docId ? detail : d)),
            );
            setDetailCache((prev) => ({ ...prev, [docId]: detail }));
          } catch {
            // fall back to status-only update
            setDocs((prev) =>
              prev.map((d) =>
                d.doc_id === docId ? { ...d, status: status.status } : d,
              ),
            );
          }
        } else {
          setDocs((prev) =>
            prev.map((d) =>
              d.doc_id === docId ? { ...d, status: status.status } : d,
            ),
          );
        }
      } catch {
        // ignore transient errors
      }
      if (elapsed >= 90_000) stopPoller(docId);
    }, 3000);
    pollersRef.current[docId] = handle;
  }, []);

  useEffect(() => {
    return () => {
      Object.values(pollersRef.current).forEach(clearInterval);
      pollersRef.current = {};
    };
  }, []);

  useEffect(() => {
    docs.forEach((d) => {
      if (
        (d.status === "processing" || d.status === "uploaded") &&
        !pollersRef.current[d.doc_id]
      ) {
        startPoller(d.doc_id);
      }
    });
  }, [docs, startPoller]);

  const onFileChange = (f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_MEDICAL_FILE_BYTES) {
      toast({
        title: "File too large",
        description: `Maximum size is ${formatBytes(MAX_MEDICAL_FILE_BYTES)}.`,
        variant: "destructive",
      });
      return;
    }
    const lower = f.name.toLowerCase();
    if (!ALLOWED_MEDICAL_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      });
      return;
    }
    setFile(f);
  };

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "No file selected",
        description: "Choose a PDF or Word document first.",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('report_type', reportType);
      if (reportDate) formData.append('report_date', reportDate);
      if (facility.trim()) formData.append('issuing_facility', facility.trim());

      const response = await axiosInstance.post(
        `${ServerAddress}/physical-health/medical/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      if (response.data.success) {
        toast({
          title: "Upload started",
          description: response.data.message || "Processing your document…",
        });
        setFile(null);
        setReportDate("");
        setFacility("");
        await loadList();
        startPoller(response.data.doc_id);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const toggleExpand = async (docId: string) => {
    if (expandedId === docId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(docId);
    if (!detailCache[docId]) {
      try {
        const detail = await getDocumentDetail(docId);
        setDetailCache((prev) => ({ ...prev, [docId]: detail }));
      } catch (e) {
        toast({
          title: "Could not load details",
          description: e instanceof Error ? e.message : "Unknown error",
          variant: "destructive",
        });
      }
    }
  };

  const onDelete = async (docId: string) => {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    setDeletingId(docId);
    try {
      await axiosInstance.delete(
        `${ServerAddress}/physical-health/medical/${docId}`,
      );
      
      stopPoller(docId);
      setDocs((prev) => prev.filter((d) => d.doc_id !== docId));
      setDetailCache((prev) => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
      if (expandedId === docId) setExpandedId(null);
      toast({
        title: "Document deleted",
      });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Upload panel */}
      <form
        onSubmit={onUpload}
        className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <UploadCloud className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="mb-1 text-base font-semibold text-foreground">
              Upload medical report
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              PDF or Word document, up to{" "}
              {formatBytes(MAX_MEDICAL_FILE_BYTES)}. AI analysis starts
              automatically.
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-input px-4 py-3 transition-colors hover:border-primary">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1 truncate text-sm text-foreground">
            {file
              ? `${file.name} (${formatBytes(file.size)})`
              : "Choose a file…"}
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Report type
            </label>
            <select
              value={reportType}
              onChange={(e) =>
                setReportType(e.target.value as MedicalReportType)
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Report date
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Issuing facility
            </label>
            <input
              type="text"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              placeholder="e.g. Apollo Hospital"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading || !file}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <UploadCloud className="h-5 w-5" />
                Upload
              </>
            )}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">
            Your medical documents
          </h3>
          <span className="text-xs text-muted-foreground">
            {docs.length} document{docs.length === 1 ? "" : "s"}
          </span>
        </div>

        {loadingList ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : docs.length === 0 ? (
          <div className="py-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No documents yet. Upload your first medical report above.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {docs.map((d) => {
              const detail = detailCache[d.doc_id] ?? d;
              const isOpen = expandedId === d.doc_id;
              const statusClass =
                STATUS_STYLES[d.status] ?? STATUS_STYLES.uploaded;
              return (
                <li key={d.doc_id} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="truncate text-sm font-medium text-foreground max-w-[160px] sm:max-w-none">
                          {d.filename}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] ${statusClass}`}
                        >
                          {d.status}
                        </span>
                        {d.urgency_level && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] ${
                              URGENCY_STYLES[d.urgency_level as UrgencyLevel] ??
                              URGENCY_STYLES.routine
                            }`}
                          >
                            {d.urgency_level}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{d.report_type}</span>
                        <span>•</span>
                        <span>Uploaded {formatDate(d.uploaded_at)}</span>
                        {d.issuing_facility && (
                          <>
                            <span>•</span>
                            <span className="truncate">
                              {d.issuing_facility}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(d.doc_id)}
                      className="rounded-lg p-2 transition-colors hover:bg-muted"
                      aria-label={isOpen ? "Collapse" : "Expand"}
                    >
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(d.doc_id)}
                      disabled={deletingId === d.doc_id}
                      className="rounded-lg p-2 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                      aria-label="Delete"
                    >
                      {deletingId === d.doc_id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="ml-0 sm:ml-12 mt-4 space-y-3">
                      {detail.status === "processing" ||
                      detail.status === "uploaded" ? (
                        <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Analysis in progress — this usually takes less than a
                          minute.
                        </div>
                      ) : detail.status === "failed" ? (
                        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                          Analysis failed. Try deleting and re-uploading the
                          document.
                        </div>
                      ) : (
                        <>
                          {detail.summary && (
                            <div>
                              <h4 className="mb-1 text-xs font-semibold text-foreground">
                                Summary
                              </h4>
                              <p className="text-xs leading-relaxed text-foreground/80">
                                {detail.summary}
                              </p>
                            </div>
                          )}
                          {detail.key_findings &&
                            detail.key_findings.length > 0 && (
                              <div>
                                <h4 className="mb-1 text-xs font-semibold text-foreground">
                                  Key findings
                                </h4>
                                <ul className="list-inside list-disc space-y-0.5 text-xs text-foreground/80">
                                  {detail.key_findings.map((f, i) => (
                                    <li key={i}>{f}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          {detail.flagged_values &&
                            detail.flagged_values.length > 0 && (
                              <div>
                                <h4 className="mb-1 text-xs font-semibold text-foreground">
                                  Flagged values
                                </h4>
                                <div className="overflow-x-auto -mx-1">
                                  <table className="w-full text-xs min-w-[360px]">
                                    <thead>
                                      <tr className="text-left text-muted-foreground">
                                        <th className="py-1 pr-3 font-medium">
                                          Marker
                                        </th>
                                        <th className="py-1 pr-3 font-medium">
                                          Value
                                        </th>
                                        <th className="py-1 pr-3 font-medium">
                                          Normal range
                                        </th>
                                        <th className="py-1 pr-3 font-medium">
                                          Status
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detail.flagged_values.map((fv, i) => (
                                        <tr
                                          key={i}
                                          className="border-t border-border"
                                        >
                                          <td className="py-1.5 pr-3 text-foreground">
                                            {fv.name}
                                          </td>
                                          <td className="py-1.5 pr-3 text-foreground">
                                            {fv.value}
                                          </td>
                                          <td className="py-1.5 pr-3 text-muted-foreground">
                                            {fv.normal_range}
                                          </td>
                                          <td className="py-1.5 pr-3">
                                            <span
                                              className={`rounded-full px-2 py-0.5 text-[10px] ${
                                                FLAG_STATUS_STYLES[fv.status] ??
                                                FLAG_STATUS_STYLES.normal
                                              }`}
                                            >
                                              {fv.status}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                                  {detail.flagged_values.map((fv, i) => (
                                    <li key={i}>
                                      <span className="font-medium text-foreground">
                                        {fv.name}:
                                      </span>{" "}
                                      {fv.plain_explanation}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          {detail.recommendations &&
                            detail.recommendations.length > 0 && (
                              <div>
                                <h4 className="mb-1 text-xs font-semibold text-foreground">
                                  Recommendations
                                </h4>
                                <ul className="list-inside list-disc space-y-0.5 text-xs text-foreground/80">
                                  {detail.recommendations.map((r, i) => (
                                    <li key={i}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          {detail.follow_up_needed && (
                            <div className="rounded-lg border border-info/30 bg-info/10 p-3 text-xs text-info">
                              Follow-up recommended — consider booking a
                              consultation.
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}