"use client";

import React, { useState, useEffect } from "react";
import { ChevronsUpDown, ChevronUp, ChevronDown, Trash2, Edit, Eye } from "lucide-react";

export interface FundTransferData {
  id: string;
  receiverOfficeId: string;
  receiverOfficeName: string;
  trxDate: string;
  reffNo: string;
  sndrVoucherNo: string;
  recVoucherNo: string;
  hoVoucherNo: string;
  debit: number;
  credit: number;
  description: string;
  createdAt: string;
}

interface Organization {
  OrgID: number;
  OrganizationName: string;
}

interface FundTransferProps {
  onBackToMenu?: () => void;
}

type SortField =
  | "receiverOfficeName"
  | "trxDate"
  | "reffNo"
  | "sndrVoucherNo"
  | "recVoucherNo"
  | "hoVoucherNo"
  | "debit"
  | "credit";

export default function FundTransfer({ onBackToMenu }: FundTransferProps) {
  // Views: "list" | "create" | "view"
  const [view, setView] = useState<"list" | "create" | "view">("list");
  
  // Data States
  const [transfers, setTransfers] = useState<FundTransferData[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    receiverOfficeId: "",
    trxDate: new Date().toISOString().split("T")[0],
    reffNo: "",
    sndrVoucherNo: "",
    recVoucherNo: "",
    hoVoucherNo: "",
    debit: 0,
    credit: 0,
    description: "",
  });
  
  const [selectedTransfer, setSelectedTransfer] = useState<FundTransferData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter States (matching screenshot layout)
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterBy, setFilterBy] = useState("View All");
  const [searchText, setSearchText] = useState("");
  
  // Applied search states for filtering the table list
  const [searchParams, setSearchParams] = useState({
    dateFrom: "",
    dateTo: "",
    filterBy: "View All",
    searchText: "",
  });

  // Table Sorting and Pagination
  const [sortField, setSortField] = useState<SortField>("trxDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(20);

  // Load transfers from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fundTransfers");
      if (saved) {
        setTransfers(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load fund transfers:", e);
    }
  }, []);

  // Save transfers to localStorage
  const saveToLocalStorage = (updated: FundTransferData[]) => {
    setTransfers(updated);
    try {
      localStorage.setItem("fundTransfers", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save fund transfers:", e);
    }
  };

  // Fetch organizations
  useEffect(() => {
    const fetchOrgs = async () => {
      setLoadingOrgs(true);
      try {
        const res = await fetch("/api/organizations");
        if (!res.ok) throw new Error("API returned error status");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setOrganizations(json.data);
        } else {
          // Graceful fallback to mock organizations if table is empty
          setOrganizations([
            { OrgID: 1, OrganizationName: "Head Office" },
            { OrgID: 2, OrganizationName: "Dhaka Branch" },
            { OrgID: 3, OrganizationName: "Chittagong Branch" },
            { OrgID: 4, OrganizationName: "Sylhet Branch" },
            { OrgID: 5, OrganizationName: "Rajshahi Branch" },
          ]);
        }
      } catch (err) {
        console.warn("Could not load database organizations, using fallback mock offices:", err);
        // Graceful fallback to mock organizations on fetch error / db offline
        setOrganizations([
          { OrgID: 1, OrganizationName: "Head Office" },
          { OrgID: 2, OrganizationName: "Dhaka Branch" },
          { OrgID: 3, OrganizationName: "Chittagong Branch" },
          { OrgID: 4, OrganizationName: "Sylhet Branch" },
          { OrgID: 5, OrganizationName: "Rajshahi Branch" },
        ]);
      } finally {
        setLoadingOrgs(false);
      }
    };
    fetchOrgs();
  }, []);

  // Input changes handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.receiverOfficeId) {
      newErrors.receiverOfficeId = "Receiver office is required";
    }
    if (!formData.trxDate) {
      newErrors.trxDate = "Transaction date is required";
    }
    if (!formData.reffNo.trim()) {
      newErrors.reffNo = "Reference number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedOrg = organizations.find((o) => o.OrgID.toString() === formData.receiverOfficeId);
    const receiverOfficeName = selectedOrg ? selectedOrg.OrganizationName : "Unknown Office";

    const newRecord: FundTransferData = {
      ...formData,
      id: selectedTransfer ? selectedTransfer.id : Math.random().toString(36).substring(2, 9),
      receiverOfficeName,
      createdAt: selectedTransfer ? selectedTransfer.createdAt : new Date().toLocaleDateString(),
    };

    let updatedTransfers: FundTransferData[];
    if (selectedTransfer) {
      updatedTransfers = transfers.map((t) => (t.id === selectedTransfer.id ? newRecord : t));
    } else {
      updatedTransfers = [newRecord, ...transfers];
    }

    saveToLocalStorage(updatedTransfers);
    setView("list");
    setSelectedTransfer(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      receiverOfficeId: "",
      trxDate: new Date().toISOString().split("T")[0],
      reffNo: "",
      sndrVoucherNo: "",
      recVoucherNo: "",
      hoVoucherNo: "",
      debit: 0,
      credit: 0,
      description: "",
    });
    setErrors({});
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Perform search / filtering logic
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      dateFrom,
      dateTo,
      filterBy,
      searchText,
    });
    setPage(1);
  };

  // Filter transfers list
  const filteredTransfers = transfers.filter((t) => {
    // 1. Date From filter
    if (searchParams.dateFrom && t.trxDate < searchParams.dateFrom) {
      return false;
    }
    // 2. Date To filter
    if (searchParams.dateTo && t.trxDate > searchParams.dateTo) {
      return false;
    }
    // 3. Text Search / Filter By
    if (searchParams.searchText) {
      const q = searchParams.searchText.toLowerCase();
      if (searchParams.filterBy === "View All") {
        return (
          t.receiverOfficeName.toLowerCase().includes(q) ||
          t.reffNo.toLowerCase().includes(q) ||
          t.sndrVoucherNo.toLowerCase().includes(q) ||
          t.recVoucherNo.toLowerCase().includes(q) ||
          t.hoVoucherNo.toLowerCase().includes(q)
        );
      } else if (searchParams.filterBy === "Receiver Office") {
        return t.receiverOfficeName.toLowerCase().includes(q);
      } else if (searchParams.filterBy === "Reference No") {
        return t.reffNo.toLowerCase().includes(q);
      }
    }
    return true;
  });

  // Sort transfers list
  const sortedTransfers = [...filteredTransfers].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate list
  const totalPages = Math.max(1, Math.ceil(sortedTransfers.length / rowCount));
  const paginatedTransfers = sortedTransfers.slice((page - 1) * rowCount, page * rowCount);

  const handleEdit = (item: FundTransferData) => {
    setSelectedTransfer(item);
    setFormData({
      receiverOfficeId: item.receiverOfficeId,
      trxDate: item.trxDate,
      reffNo: item.reffNo,
      sndrVoucherNo: item.sndrVoucherNo,
      recVoucherNo: item.recVoucherNo,
      hoVoucherNo: item.hoVoucherNo,
      debit: item.debit,
      credit: item.credit,
      description: item.description,
    });
    setView("create");
  };

  const handleViewDetails = (item: FundTransferData) => {
    setSelectedTransfer(item);
    setView("view");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this fund transfer record?")) {
      const updated = transfers.filter((t) => t.id !== id);
      saveToLocalStorage(updated);
    }
  };

  return (
    <div className="card" style={{ maxWidth: "100%", width: "100%" }}>
      {/* 1. LIST VIEW */}
      {view === "list" && (
        <>
          {/* Header Row matching screenshot */}
          <div className="flex-between-header">
            <h2 className="page-title" style={{ color: "#334155" }}>
              Fund Transfer
            </h2>
            <button
              onClick={() => {
                resetForm();
                setSelectedTransfer(null);
                setView("create");
              }}
              className="btn"
              style={{
                backgroundColor: "var(--erp-cyan)",
                color: "#fff",
                border: "1px solid var(--erp-cyan-border)",
                padding: "6px 16px",
                fontWeight: "500",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Add New
            </button>
          </div>

          {/* Filters Form matching screenshot layout */}
          <form
            onSubmit={handleSearch}
            className="flex-gap-4 items-center"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              padding: "16px 0",
              borderBottom: "1px solid var(--border-color)",
              marginBottom: "16px",
              fontSize: "13px",
            }}
          >
            <div className="flex items-center" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ whiteSpace: "nowrap" }}>Date From:</span>
              <input
                type="text"
                placeholder="Type Search Text"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="form-input"
                style={{ width: "150px", margin: 0 }}
              />
            </div>

            <div className="flex items-center" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ whiteSpace: "nowrap" }}>Date To:</span>
              <input
                type="text"
                placeholder="Type Search Text"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="form-input"
                style={{ width: "150px", margin: 0 }}
              />
            </div>

            <div className="flex items-center" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontWeight: "bold" }}>Filter By:</span>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="form-select"
                style={{ width: "150px", margin: 0 }}
              >
                <option value="View All">View All</option>
                <option value="Receiver Office">Receiver Office</option>
                <option value="Reference No">Reference No</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Type Search Text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="form-input"
              style={{ width: "180px", margin: 0 }}
            />

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                backgroundColor: "var(--erp-blue)",
                color: "#fff",
                border: `1px solid var(--erp-blue-dark)`,
                padding: "6px 18px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Search
            </button>
          </form>

          {/* Data Table */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead style={{ backgroundColor: "var(--erp-blue)", color: "#fff" }}>
                <tr>
                  <th onClick={() => handleSort("receiverOfficeName")} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                      <span>ReceiverOffice</span>
                      {sortField === "receiverOfficeName" ? (
                        sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      ) : (
                        <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                      )}
                    </div>
                  </th>
                  <th onClick={() => handleSort("trxDate")} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                      <span>Trx Date</span>
                      {sortField === "trxDate" ? (
                        sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      ) : (
                        <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                      )}
                    </div>
                  </th>
                  <th onClick={() => handleSort("reffNo")} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                      <span>ReffNo</span>
                      {sortField === "reffNo" ? (
                        sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      ) : (
                        <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                      )}
                    </div>
                  </th>
                  <th onClick={() => handleSort("sndrVoucherNo")} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                      <span>Sndr.VoucherNo</span>
                      {sortField === "sndrVoucherNo" ? (
                        sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      ) : (
                        <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                      )}
                    </div>
                  </th>
                  <th onClick={() => handleSort("recVoucherNo")} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                      <span>Rec. VoucherNo</span>
                      {sortField === "recVoucherNo" ? (
                        sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      ) : (
                        <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                      )}
                    </div>
                  </th>
                  <th onClick={() => handleSort("hoVoucherNo")} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                      <span>HO. VoucherNo</span>
                      {sortField === "hoVoucherNo" ? (
                        sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      ) : (
                        <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                      )}
                    </div>
                  </th>
                  <th onClick={() => handleSort("debit")} style={{ cursor: "pointer", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                      <span>Debit</span>
                      {sortField === "debit" ? (
                        sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      ) : (
                        <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                      )}
                    </div>
                  </th>
                  <th onClick={() => handleSort("credit")} style={{ cursor: "pointer", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                      <span>Credit</span>
                      {sortField === "credit" ? (
                        sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      ) : (
                        <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                      )}
                    </div>
                  </th>
                  <th style={{ width: "160px", textAlign: "center" }}>View</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: "16px", color: "#64748b", fontSize: "13px" }}>
                      No data available!
                    </td>
                  </tr>
                ) : (
                  paginatedTransfers.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: "500" }}>{item.receiverOfficeName}</td>
                      <td>{item.trxDate}</td>
                      <td>{item.reffNo}</td>
                      <td>{item.sndrVoucherNo || "-"}</td>
                      <td>{item.recVoucherNo || "-"}</td>
                      <td>{item.hoVoucherNo || "-"}</td>
                      <td className="text-right" style={{ fontFamily: "monospace", fontWeight: "600" }}>
                        {item.debit > 0 ? item.debit.toFixed(2) : "-"}
                      </td>
                      <td className="text-right" style={{ fontFamily: "monospace", fontWeight: "600" }}>
                        {item.credit > 0 ? item.credit.toFixed(2) : "-"}
                      </td>
                      <td className="text-center">
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleViewDetails(item)}
                            className="btn-link"
                            title="View details"
                            style={{ color: "var(--erp-blue)" }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="btn-link"
                            title="Edit"
                            style={{ color: "#e0a800" }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="btn-link text-danger"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div
            className="pagination-container"
            style={{
              padding: "12px",
              borderTop: "1px solid var(--border-color)",
              backgroundColor: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <label className="flex-gap-2 items-center" style={{ display: "flex", fontSize: "12px", color: "#374151" }}>
                Row count:
                <select
                  value={rowCount}
                  onChange={(e) => {
                    setRowCount(Number(e.target.value));
                    setPage(1);
                  }}
                  className="pagination-select"
                  style={{ marginLeft: "6px" }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn btn-secondary"
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                >
                  Prev
                </button>
                <span style={{ fontSize: "12px", color: "#374151" }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="btn btn-secondary"
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 2. CREATE / EDIT FORM VIEW */}
      {view === "create" && (
        <div>
          <div className="flex-between-header">
            <h2 className="page-title">
              {selectedTransfer ? "Edit Fund Transfer" : "Create Fund Transfer"}
            </h2>
            <button
              onClick={() => setView("list")}
              className="btn btn-secondary"
              style={{
                padding: "6px 14px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Back to List
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
            {/* Grid layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "30px", rowGap: "16px" }}>
              
              {/* Receiver Office */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: "bold" }}>
                  Receiver Office <span className="text-danger">*</span>
                </label>
                <select
                  name="receiverOfficeId"
                  value={formData.receiverOfficeId}
                  onChange={handleChange}
                  className="form-select"
                  style={{ borderColor: errors.receiverOfficeId ? "var(--erp-danger)" : "" }}
                  disabled={loadingOrgs}
                >
                  <option value="">-- Select Office --</option>
                  {organizations.map((org) => (
                    <option key={org.OrgID} value={org.OrgID.toString()}>
                      {org.OrganizationName}
                    </option>
                  ))}
                </select>
                {errors.receiverOfficeId && <p className="error-message">{errors.receiverOfficeId}</p>}
                {loadingOrgs && <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Loading offices...</p>}
              </div>

              {/* Transaction Date */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: "bold" }}>
                  Transaction Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="trxDate"
                  value={formData.trxDate}
                  onChange={handleChange}
                  className="form-input"
                  style={{ borderColor: errors.trxDate ? "var(--erp-danger)" : "" }}
                />
                {errors.trxDate && <p className="error-message">{errors.trxDate}</p>}
              </div>

              {/* Reference Number */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: "bold" }}>
                  Reference No (ReffNo) <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="reffNo"
                  value={formData.reffNo}
                  onChange={handleChange}
                  placeholder="Enter reference number..."
                  className="form-input"
                  style={{ borderColor: errors.reffNo ? "var(--erp-danger)" : "" }}
                />
                {errors.reffNo && <p className="error-message">{errors.reffNo}</p>}
              </div>

              {/* Sender Voucher Number */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: "bold" }}>
                  Sender Voucher No
                </label>
                <input
                  type="text"
                  name="sndrVoucherNo"
                  value={formData.sndrVoucherNo}
                  onChange={handleChange}
                  placeholder="Enter sender voucher no..."
                  className="form-input"
                />
              </div>

              {/* Receiver Voucher Number */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: "bold" }}>
                  Receiver Voucher No
                </label>
                <input
                  type="text"
                  name="recVoucherNo"
                  value={formData.recVoucherNo}
                  onChange={handleChange}
                  placeholder="Enter receiver voucher no..."
                  className="form-input"
                />
              </div>

              {/* HO Voucher Number */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: "bold" }}>
                  Head Office Voucher No
                </label>
                <input
                  type="text"
                  name="hoVoucherNo"
                  value={formData.hoVoucherNo}
                  onChange={handleChange}
                  placeholder="Enter HO voucher no..."
                  className="form-input"
                />
              </div>

              {/* Debit */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: "bold" }}>
                  Debit Amount
                </label>
                <input
                  type="number"
                  name="debit"
                  value={formData.debit}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              {/* Credit */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: "bold" }}>
                  Credit Amount
                </label>
                <input
                  type="number"
                  name="credit"
                  value={formData.credit}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              {/* Description */}
              <div className="form-group" style={{ gridColumn: "span 2", margin: 0 }}>
                <label className="form-label" style={{ fontWeight: "bold" }}>
                  Description / Remarks
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter remarks..."
                  className="form-input"
                  style={{ minHeight: "80px", fontFamily: "sans-serif" }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "12px" }}>
              <button
                type="submit"
                className="btn"
                style={{
                  backgroundColor: "var(--erp-blue)",
                  color: "#fff",
                  padding: "8px 28px",
                  borderRadius: "4px",
                  fontWeight: "500",
                  cursor: "pointer",
                  border: `1px solid var(--erp-blue-dark)`,
                }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setView("list");
                  setSelectedTransfer(null);
                }}
                className="btn btn-secondary"
                style={{ padding: "8px 28px", borderRadius: "4px" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. VIEW DETAILS MODE */}
      {view === "view" && selectedTransfer && (
        <div>
          <div className="flex-between-header">
            <h2 className="page-title">Fund Transfer Details</h2>
            <button
              onClick={() => {
                setView("list");
                setSelectedTransfer(null);
              }}
              className="btn btn-secondary"
              style={{
                padding: "6px 14px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Back to List
            </button>
          </div>

          <div
            style={{
              marginTop: "20px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              padding: "20px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
            }}
          >
            <div>
              <p style={{ margin: "8px 0" }}>
                <strong>Receiver Office:</strong> {selectedTransfer.receiverOfficeName}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Transaction Date:</strong> {selectedTransfer.trxDate}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Reference No:</strong> {selectedTransfer.reffNo}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Debit Amount:</strong> {selectedTransfer.debit > 0 ? `$${selectedTransfer.debit.toFixed(2)}` : "-"}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Credit Amount:</strong> {selectedTransfer.credit > 0 ? `$${selectedTransfer.credit.toFixed(2)}` : "-"}
              </p>
            </div>
            <div>
              <p style={{ margin: "8px 0" }}>
                <strong>Sender Voucher No:</strong> {selectedTransfer.sndrVoucherNo || "-"}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Receiver Voucher No:</strong> {selectedTransfer.recVoucherNo || "-"}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>HO. Voucher No:</strong> {selectedTransfer.hoVoucherNo || "-"}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Created Date:</strong> {selectedTransfer.createdAt}
              </p>
            </div>
            <div style={{ gridColumn: "span 2", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
              <p style={{ margin: "8px 0" }}>
                <strong>Description / Remarks:</strong>
              </p>
              <p style={{ backgroundColor: "#fff", padding: "12px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                {selectedTransfer.description || "No description provided."}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
            <button
              onClick={() => handleEdit(selectedTransfer)}
              className="btn btn-primary"
              style={{ padding: "8px 24px", marginRight: "12px" }}
            >
              Edit Record
            </button>
            <button
              onClick={() => {
                setView("list");
                setSelectedTransfer(null);
              }}
              className="btn btn-secondary"
              style={{ padding: "8px 24px" }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
