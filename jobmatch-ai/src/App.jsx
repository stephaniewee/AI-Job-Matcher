import { useState } from "react";
import ResumeUpload from "./components/ResumeUpload";
import JobSearch from "./components/JobSearch";
import MatchScore from "./components/MatchScore";
import TailoredResume from "./components/TailoredResume";
import "./App.css";

const PHASES = ["resume", "jobs", "match", "tailor"];

const PHASE_LABELS = {
    resume: { num: "01", title: "Resume" },
    jobs: { num: "02", title: "Jobs" },
    match: { num: "03", title: "Match" },
    tailor: { num: "04", title: "Tailor" },
};

export default function App() {
    const [phase, setPhase] = useState("resume");
    const [resumeText, setResumeText] = useState("");
    const [selectedJob, setSelectedJob] = useState(null);
    const [matchResult, setMatchResult] = useState(null);

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

    function handleRestart() {
        setPhase("jobs"); // keep the resume, just pick a new job
        setSelectedJob(null);
        setMatchResult(null);
    }

    return (
        <div className="app">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="logo">
                    job<span className="logo-accent">/</span>match
                </div>

                <nav className="nav">
                    {PHASES.map((p) => (
                        <div
                            key={p}
                            className={`nav-item ${phase === p ? "active" : ""} ${PHASES.indexOf(p) > PHASES.indexOf(phase) ? "locked" : ""
                                }`}
                        >
                            <div className="nav-dot" />
                            <span>{PHASE_LABELS[p].title}</span>
                            <span className="nav-num">{PHASE_LABELS[p].num}</span>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="footer-label">powered by</div>
                    <div className="footer-model">gemini-1.5-flash</div>
                    {resumeText && (
                        <div className="resume-ready">
                            resume loaded ✓
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content */}
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
                    />
                )}
            </main>
        </div>
    );
}