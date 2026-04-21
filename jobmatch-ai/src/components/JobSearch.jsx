import { useState } from "react";
import axios from "axios";

export default function JobSearch({ onJobSelected, onBack }) {
    const [query, setQuery] = useState("");
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);

    async function searchJobs() {
        if (!query.trim()) return;
        setLoading(true);
        setError("");
        setJobs([]);
        setSelectedJob(null);
        setSearched(true);

        try {
            const response = await axios.get("https://jsearch.p.rapidapi.com/search", {
                params: {
                    query: query,
                    num_pages: "1",
                    page: "1",
                },
                headers: {
                    "X-RapidAPI-Key": process.env.REACT_APP_JSEARCH_KEY,
                    "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
                },
            });
            const results = response.data.data || [];
            if (results.length === 0) {
                setError("No jobs found. Try a different search term.");
            } else {
                setJobs(results.slice(0, 6)); // show top 6 results
            }
        } catch (err) {
            setError("Search failed. Check your JSearch API key in .env");
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") searchJobs();
    }

    function handleSelect(job) {
        setSelectedJob(job);
    }

    function handleNext() {
        if (!selectedJob) {
            setError("Please select a job first.");
            return;
        }
        onJobSelected({
            title: selectedJob.job_title,
            company: selectedJob.employer_name,
            location: selectedJob.job_city || selectedJob.job_country,
            description: selectedJob.job_description,
        });
    }

    return (
        <div className="phase-container">
            <div className="phase-header">
                <span className="phase-num">02</span>
                <div>
                    <h2>Search for a job</h2>
                    <p className="phase-sub">Find a role you want to apply for</p>
                </div>
            </div>

            {/* Search bar */}
            <div className="search-row">
                <input
                    type="text"
                    className="search-input"
                    placeholder='e.g. "software engineer Singapore" or "data analyst fintech"'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button className="btn-primary" onClick={searchJobs} disabled={loading || !query.trim()}>
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {/* Job results */}
            {loading && (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Finding jobs...</p>
                </div>
            )}

            {!loading && jobs.length > 0 && (
                <div className="job-list">
                    <div className="list-label">Select a job to match against your resume</div>
                    {jobs.map((job) => (
                        <div
                            key={job.job_id}
                            className={`job-card ${selectedJob?.job_id === job.job_id ? "selected" : ""}`}
                            onClick={() => handleSelect(job)}
                        >
                            <div className="job-card-main">
                                <div className="job-title">{job.job_title}</div>
                                <div className="job-meta">
                                    {job.employer_name} · {job.job_city || job.job_country} · {job.job_employment_type}
                                </div>
                                <div className="job-snippet">
                                    {job.job_description?.slice(0, 120)}...
                                </div>
                            </div>
                            {selectedJob?.job_id === job.job_id && (
                                <div className="selected-badge">selected ✓</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!loading && searched && jobs.length === 0 && !error && (
                <div className="empty-state">No results yet — try searching above.</div>
            )}

            <div className="phase-actions">
                <button className="btn-ghost" onClick={onBack}>← Back</button>
                <button
                    className="btn-primary"
                    onClick={handleNext}
                    disabled={!selectedJob}
                >
                    Analyse Match →
                </button>
            </div>
        </div>
    );
}