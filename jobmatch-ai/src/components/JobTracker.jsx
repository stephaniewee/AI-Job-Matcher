export default function JobTracker({ jobs, onUpdateStatus, onNewJob, onBack }) {
    const statuses = ["applied", "interviewing", "offer", "rejected"];

    const statusStyle = {
        applied: { bg: "#1a1a00", color: "#ffd740", border: "#3a3a00" },
        interviewing: { bg: "#0f1a2a", color: "#7ab8f9", border: "#1a3a5a" },
        offer: { bg: "#001a12", color: "#7af9c8", border: "#005a40" },
        rejected: { bg: "#2a0a00", color: "#ff8a65", border: "#4a1a00" },
    };

    const scoreColor = (score) =>
        score >= 75 ? "#c8f97a" : score >= 50 ? "#ffd740" : "#ff8a65";

    return (
        <div className="phase-container">
            <div className="phase-header">
                <span className="phase-num">06</span>
                <div>
                    <h2>Job Tracker</h2>
                    <p className="phase-sub">{jobs.length} job{jobs.length !== 1 ? "s" : ""} tracked this session</p>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div className="empty-tracker">
                    <div className="empty-icon">○</div>
                    <p>No jobs tracked yet.</p>
                    <p className="hint">Complete the full flow for a job and it'll appear here.</p>
                    <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={onNewJob}>
                        Find a Job →
                    </button>
                </div>
            ) : (
                <>
                    {/* Summary row */}
                    <div className="tracker-summary">
                        {statuses.map((s) => {
                            const count = jobs.filter((j) => j.status === s).length;
                            const style = statusStyle[s];
                            return (
                                <div key={s} className="summary-pill" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                                    <span style={{ color: style.color, fontFamily: "var(--mono)", fontSize: "18px", fontWeight: "500" }}>{count}</span>
                                    <span style={{ color: style.color, fontSize: "11px", marginTop: "2px", textTransform: "capitalize" }}>{s}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Job rows */}
                    <div className="tracker-list">
                        {jobs.map((entry) => {
                            const style = statusStyle[entry.status];
                            return (
                                <div key={entry.id} className="tracker-row">
                                    <div className="tracker-info">
                                        <div className="tracker-title">{entry.job.title}</div>
                                        <div className="tracker-meta">{entry.job.company} · {entry.job.location} · {entry.date}</div>
                                    </div>
                                    <div className="tracker-score" style={{ color: scoreColor(entry.score) }}>
                                        {entry.score}%
                                    </div>
                                    <select
                                        className="status-select"
                                        value={entry.status}
                                        style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
                                        onChange={(e) => onUpdateStatus(entry.id, e.target.value)}
                                    >
                                        {statuses.map((s) => (
                                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            <div className="phase-actions">
                <button className="btn-ghost" onClick={onBack}>← Back</button>
                <button className="btn-primary" onClick={onNewJob}>+ Track New Job</button>
            </div>
        </div>
    );
}