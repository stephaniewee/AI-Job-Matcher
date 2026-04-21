import { useState, useEffect } from "react";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_KEY, dangerouslyAllowBrowser: true });

export default function InterviewPrep({ resumeText, job, matchResult, onBack, onRestart, onTracker }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { generateQuestions(); }, []);

    async function generateQuestions() {
        setLoading(true);
        setError("");
        try {
            const prompt = `You are an expert interview coach.

Based on the resume and job description below, generate 8 likely interview questions the candidate will face.
Mix of: technical, behavioural, situational, and culture-fit questions.

For each question return a suggested answer based on the candidate's actual resume.

Return ONLY a valid JSON array — no markdown, no backticks, no explanation:
[
  {
    "category": "<Technical|Behavioural|Situational|Culture>",
    "question": "<interview question>",
    "suggested_answer": "<2-3 sentence suggested answer based on the resume>"
  },
  ...
]

RESUME:
${resumeText}

JOB (${job.title} at ${job.company}):
${job.description?.slice(0, 1000)}

GAPS TO ADDRESS:
${matchResult?.gaps?.join(", ")}`;

            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.5,
            });

            const text = response.choices[0].message.content.trim();
            const cleaned = text.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleaned);
            setQuestions(parsed);
        } catch (err) {
            setError("Failed to generate questions. Try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const categoryColor = {
        Technical: { bg: "#0f1a2a", color: "#7ab8f9", border: "#1a3a5a" },
        Behavioural: { bg: "#1a0f2a", color: "#c87af9", border: "#3a1a5a" },
        Situational: { bg: "#1a1a00", color: "#f9d97a", border: "#3a3a00" },
        Culture: { bg: "#001a12", color: "#7af9c8", border: "#005a40" },
    };

    return (
        <div className="phase-container">
            <div className="phase-header">
                <span className="phase-num">05</span>
                <div>
                    <h2>Interview Prep</h2>
                    <p className="phase-sub">Likely questions for {job.title} at {job.company}</p>
                </div>
            </div>

            {loading && (
                <div className="loading-state tall">
                    <div className="spinner" />
                    <p>Generating interview questions...</p>
                    <p className="hint">Tailored to your resume and this role</p>
                </div>
            )}

            {error && (
                <div className="error-msg">
                    {error}
                    <button className="retry-btn" onClick={generateQuestions}>Retry</button>
                </div>
            )}

            {!loading && questions.length > 0 && (
                <>
                    <div className="hint" style={{ marginBottom: "4px" }}>
                        Click any question to see a suggested answer based on your resume
                    </div>
                    <div className="questions-list">
                        {questions.map((q, i) => {
                            const colors = categoryColor[q.category] || categoryColor["Culture"];
                            return (
                                <div
                                    key={i}
                                    className={`question-card ${expanded === i ? "open" : ""}`}
                                    onClick={() => setExpanded(expanded === i ? null : i)}
                                >
                                    <div className="question-header">
                                        <span
                                            className="q-category"
                                            style={{ background: colors.bg, color: colors.color, border: `1px solid ${colors.border}` }}
                                        >
                                            {q.category}
                                        </span>
                                        <span className="q-text">{q.question}</span>
                                        <span className="q-toggle">{expanded === i ? "▲" : "▼"}</span>
                                    </div>
                                    {expanded === i && (
                                        <div className="question-answer">
                                            <div className="answer-label">Suggested answer</div>
                                            <p>{q.suggested_answer}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="card" style={{ marginTop: "0.5rem" }}>
                        <div className="card-label">Tips for this role</div>
                        <ul className="analysis-list strength-list">
                            {matchResult?.gaps?.slice(0, 3).map((g, i) => (
                                <li key={i}>Prepare to address: {g}</li>
                            ))}
                            <li>Research {job.company}'s recent news before the interview</li>
                            <li>Prepare 2–3 questions to ask the interviewer</li>
                        </ul>
                    </div>
                </>
            )}

            <div className="phase-actions">
                <button className="btn-ghost" onClick={onBack}>← Back</button>
                <button className="btn-ghost" onClick={generateQuestions} disabled={loading}>↺ Regenerate</button>
                <button className="btn-ghost" onClick={onRestart}>+ New Job</button>
                <button className="btn-primary" onClick={onTracker}>View Tracker →</button>
            </div>
        </div>
    );
}