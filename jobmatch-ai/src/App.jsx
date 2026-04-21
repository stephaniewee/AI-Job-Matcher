import { useState } from "react";
import ResumeUpload from "./components/ResumeUpload";
import JobSearch from "./components/JobSearch";
import MatchScore from "./components/MatchScore";
import TailoredResume from "./components/TailoredResume";
import InterviewPrep from "./components/InterviewPrep";
import JobTracker from "./components/JobTracker";
import "./App.css";

const PHASES = ["resume", "jobs", "match", "tailor", "interview", "tracker"];

const PHASE_LABELS = {
    resume: { num: "01", title: "Resume" },
    jobs: { num: "02", title: "Jobs" },
    match: { num: "03", title: "Match" },
    tailor: { num: "04", title: "Tailor" },
    interview: { num: "05", title: "Interview" },
    tracker: { num: "06", title: "Tracker" },
};

export default function App() {
    const [phase, setPhase] = useState("resume");
    const [resumeText, setResumeText] = useState("");
    const [selectedJob, setSelectedJob] = useState(null);
    const [matchResult, setMatchResult] = useState(null);
    const [trackedJobs, setTrackedJobs] = useState([]);

    function handleResumeReady(text) {
        setResumeText(text);
        setPhase("jobs");
    }

    function handleJobSelected(job) {
        setSelectedJob(job);
        setPhase("match");
    }

    function handleMatchDone(result) {
        setMatchResult(result);
        setPhase("tailor");
    }

    function handleTailorDone() {
        // Save to tracker
        const entry = {
            id: Date.now(),
            job: selectedJob,
            score: matchResult?.score,
            status: "applied",
            date: new Date().toLocaleDateString("en-SG"),
        };
        setTrackedJobs((prev) => [entry, ...prev]);
        setPhase("interview");
    }

    function handleRestart() {
        setSelectedJob(null);
        setMatchResult(null);
        setPhase("jobs");
    }

    function updateJobStatus(id, status) {
        setTrackedJobs((prev) =>
            prev.map((j) => (j.id === id ? { ...j, status } : j))
        );
    }

    return (
        <div className="app">
            <aside className="sidebar">
                <div className="logo"><div className="logo-dot"></div>
                    job<span className="logo-accent">/</span>match
                </div>

                <nav className="nav">
                    {PHASES.map((p) => (
                        <div
                            key={p}
                            className={`nav-item ${phase === p ? "active" : ""} ${PHASES.indexOf(p) > PHASES.indexOf(phase) ? "locked" : ""
                                }`}
                            onClick={() => {
                                // allow clicking tracker anytime
                                if (p === "tracker") setPhase("tracker");
                            }}
                            style={{ cursor: p === "tracker" ? "pointer" : "default" }}
                        >
                            <div className="nav-dot" />
                            <span>{PHASE_LABELS[p].title}</span>
                            {p === "tracker" && trackedJobs.length > 0 ? (
                                <span className="nav-badge">{trackedJobs.length}</span>
                            ) : (
                                <span className="nav-num">{PHASE_LABELS[p].num}</span>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="footer-label">powered by</div>
                    <div className="footer-model">groq · llama-3.3-70b</div>
                    {resumeText && <div className="resume-ready">resume loaded ✓</div>}
                </div>
            </aside>

            <main className="main">
                {phase === "resume" && (
                    <ResumeUpload onResumeReady={handleResumeReady} />
                )}
                {phase === "jobs" && (
                    <JobSearch
                        onJobSelected={handleJobSelected}
                        onBack={() => setPhase("resume")}
                    />
                )}
                {phase === "match" && (
                    <MatchScore
                        resumeText={resumeText}
                        job={selectedJob}
                        onBack={() => setPhase("jobs")}
                        onNext={handleMatchDone}
                    />
                )}
                {phase === "tailor" && (
                    <TailoredResume
                        resumeText={resumeText}
                        job={selectedJob}
                        matchResult={matchResult}
                        onBack={() => setPhase("match")}
                        onRestart={handleRestart}
                        onNext={handleTailorDone}
                    />
                )}
                {phase === "interview" && (
                    <InterviewPrep
                        resumeText={resumeText}
                        job={selectedJob}
                        matchResult={matchResult}
                        onBack={() => setPhase("tailor")}
                        onRestart={handleRestart}
                        onTracker={() => setPhase("tracker")}
                    />
                )}
                {phase === "tracker" && (
                    <JobTracker
                        jobs={trackedJobs}
                        onUpdateStatus={updateJobStatus}
                        onNewJob={handleRestart}
                        onBack={() => setPhase("interview")}
                    />
                )}
            </main>
        </div>
    );
}