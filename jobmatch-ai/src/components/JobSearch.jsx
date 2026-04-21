import { useState } from "react";
import axios from "axios";

const EMPLOYMENT_TYPES = ["Any", "FULLTIME", "PARTTIME", "CONTRACTOR", "INTERN"];
const TABS = ["JSearch", "Paste JD"];

export default function JobSearch({ onJobSelected, onBack }) {
    const [tab, setTab] = useState("JSearch");

    // JSearch
    const [query, setQuery] = useState("");
    const [empType, setEmpType] = useState("Any");
    const [jsearchJobs, setJsearchJobs] = useState([]);
    const [jsearchSelected, setJsearchSelected] = useState(null);

    // Paste JD
    const [pasteTitle, setPasteTitle] = useState("");
    const [pasteCompany, setPasteCompany] = useState("");
    const [pasteJD, setPasteJD] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);

    async function searchJSearch() {
        if (!query.trim()) return;
        setLoading(true);
        setError("");
        setJsearchJobs([]);
        setJsearchSelected(null);
        setSearched(true);
        try {
            const params = {
                query: `${query} Singapore`,
                num_pages: "1",
                page: "1",
                country: "SG",
            };
            if (empType !== "Any") params.employment_types = empType;

            const response = await axios.get("https://jsearch.p.rapidapi.com/search", {
                params,
                headers: {
                    "X-RapidAPI-Key": process.env.REACT_APP_JSEARCH_KEY,
                    "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
                },
            });
            const results = response.data.data || [];
            if (results.length === 0) setError("No jobs found. Try a different search term.");
            else setJsearchJobs(results.slice(0, 8));
        } catch (err) {
            setError("Search failed. Check your JSearch API key in .env");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") searchJSearch();
    }

    function handleNext() {
        if (tab === "JSearch") {
            if (!jsearchSelected) { setError("Please select a job first."); return; }
            onJobSelected({
                title: jsearchSelected.job_title,
                company: jsearchSelected.employer_name,
                location: jsearchSelected.job_city || "Singapore",
                description: jsearchSelected.job_description,
                source: jsearchSelected.job_publisher || "JSearch",
                url: jsearchSelected.job_apply_link || "",
            });
        } else {
            if (!pasteJD.trim()) { setError("Please paste a job description first."); return; }
            onJobSelected({
                title: pasteTitle || "Untitled Role",
                company: pasteCompany || "Unknown Company",
                location: "Singapore",
                description: pasteJD,
                source: "Manual",
                url: "",
            });
        }
    }

    function getSource(job) {
        const publisher = (job.job_publisher || "").toLowerCase();
        if (publisher.includes("linkedin")) return "linkedin";
        return job.job_publisher || "board";
    }

    const canProceed =
        (tab === "JSearch" && jsearchSelected) ||
        (tab === "Paste JD" && pasteJD.trim());

    return (
        <div className="phase-container">
            <div className="phase-header">
                <span className="phase-num">02</span>
                <div>
                    <h2>Find a job</h2>
                    <p className="phase-sub">Search listings or paste a JD directly</p>
                </div>
            </div>

            <div className="mode-toggle">
                {TABS.map((t) => (
                    <button
                        key={t}
                        className={`toggle-btn ${tab === t ? "active" : ""}`}
                        onClick={() => { setTab(t); setError(""); setSearched(false); }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* ── JSearch Tab ── */}
            {tab === "JSearch" && (
                <>
                    <div className="search-filters">
                        <div className="filter-tag">Singapore</div>
                        {EMPLOYMENT_TYPES.slice(1).map((t) => (
                            <button
                                key={t}
                                className={`toggle-btn ${empType === t ? "active" : ""}`}
                                style={{ padding: "5px 12px", fontSize: "11px", fontFamily: "var(--mono)" }}
                                onClick={() => setEmpType(empType === t ? "Any" : t)}
                            >
                                {t.charAt(0) + t.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                    <div className="search-row">
                        <input
                            type="text"
                            className="search-input"
                            placeholder='e.g. "software engineer" or "data analyst"'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="btn-primary" onClick={searchJSearch} disabled={loading || !query.trim()}>
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>
                    {loading && (
                        <div className="loading-state">
                            <div className="spinner" />
                            <p>Searching listings...</p>
                        </div>
                    )}
                    {!loading && jsearchJobs.length > 0 && (
                        <div className="job-list">
                            <div className="list-label">{jsearchJobs.length} results — click to select</div>
                            {jsearchJobs.map((job) => {
                                const source = getSource(job);
                                return (
                                    <div
                                        key={job.job_id}
                                        className={`job-card ${jsearchSelected?.job_id === job.job_id ? "selected" : ""}`}
                                        onClick={() => setJsearchSelected(job)}
                                    >
                                        <div className="job-card-main">
                                            <div className="job-title">{job.job_title}</div>
                                            <div className="job-meta">
                                                {job.employer_name} · {job.job_city || "Singapore"} · {job.job_employment_type || "Full-time"}
                                            </div>
                                            <div className="job-snippet">{job.job_description?.slice(0, 130)}...</div>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                                            <span className={`job-source ${source === "linkedin" ? "linkedin" : ""}`}>{source}</span>
                                            {jsearchSelected?.job_id === job.job_id && <span className="selected-badge">selected ✓</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {!loading && searched && jsearchJobs.length === 0 && !error && (
                        <div className="empty-state">No results — try a different term.</div>
                    )}
                </>
            )}

            {/* ── Paste JD Tab ── */}
            {tab === "Paste JD" && (
                <>
                    <div className="search-filters">
                        <div className="filter-tag">LinkedIn</div>
                        <div className="filter-tag">Indeed</div>
                        <div className="filter-tag">MyCareersFuture</div>
                        <div className="filter-tag">Any site</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div>
                            <div className="list-label" style={{ marginBottom: "6px" }}>Job title</div>
                            <input
                                type="text"
                                className="search-input"
                                placeholder='e.g. "Software Engineer"'
                                value={pasteTitle}
                                onChange={(e) => setPasteTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="list-label" style={{ marginBottom: "6px" }}>Company name</div>
                            <input
                                type="text"
                                className="search-input"
                                placeholder='e.g. "Grab"'
                                value={pasteCompany}
                                onChange={(e) => setPasteCompany(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="list-label" style={{ marginBottom: "6px" }}>Paste job description</div>
                        <textarea
                            className="resume-textarea"
                            rows={12}
                            placeholder="Copy and paste the full job description here from LinkedIn, Indeed, MyCareersFuture, or any company website..."
                            value={pasteJD}
                            onChange={(e) => setPasteJD(e.target.value)}
                        />
                    </div>
                    {pasteJD.trim() && (
                        <div className="hint" style={{ textAlign: "right" }}>
                            {pasteJD.trim().split(/\s+/).length} words ✓
                        </div>
                    )}
                </>
            )}

            {error && <div className="error-msg">{error}</div>}

            <div className="phase-actions">
                <button className="btn-ghost" onClick={onBack}>← Back</button>
                <button className="btn-primary" onClick={handleNext} disabled={!canProceed}>
                    Analyse Match →
                </button>
            </div>
        </div>
    );
}