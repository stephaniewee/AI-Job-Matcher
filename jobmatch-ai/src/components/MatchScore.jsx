import { useState, useEffect } from "react";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_KEY, dangerouslyAllowBrowser: true });

export default function MatchScore({ resumeText, job, onBack, onNext }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        analyseMatch();
    }, []);

    async function analyseMatch() {
        setLoading(true);
        setError("");
        try {
            const prompt = `You are a professional resume analyst and ATS expert.

Analyse the resume below against the job description and return ONLY a valid JSON object — no markdown, no backticks, no explanation.

JSON format:
{
  "score": <number 0-100>,
  "verdict": "<one sentence summary of the match>",
  "matched_keywords": ["<keyword>", ...],
  "missing_keywords": ["<keyword>", ...],
  "gaps": ["<gap description>", ...],
  "strengths": ["<strength>", ...]
}

RESUME:
${resumeText}

JOB DESCRIPTION (${job.title} at ${job.company}):
${job.description}`;

            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
            });

            const text = response.choices[0].message.content.trim();
            const cleaned = text.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleaned);
            setResult(parsed);
        } catch (err) {
            setError("Analysis failed. Check your Groq API key or try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const circumference = 2 * Math.PI * 40;
    const offset = result ? circumference - (result.score / 100) * circumference : circumference;

    const scoreColor =
        !result ? "#888" :
            result.score >= 75 ? "#c8f97a" :
                result.score >= 50 ? "#ffd740" : "#ff8a65";

    return (
        <div className="phase-container">
            <div className="phase-header">
                <span className="phase-num">03</span>
                <div>
                    <h2>Match Analysis</h2>
                    <p className="phase-sub">{job.title} at {job.company}</p>
                </div>
            </div>

            {loading && (
                <div className="loading-state tall">
                    <div className="spinner" />
                    <p>Analysing your resume...</p>
                    <p className="hint">This takes about 5–10 seconds</p>
                </div>
            )}

            {error && (
                <div className="error-msg">
                    {error}
                    <button className="retry-btn" onClick={analyseMatch}>Retry</button>
                </div>
            )}

            {result && !loading && (
                <>
                    <div className="score-section">
                        <div className="score-ring">
                            <svg width="100" height="100" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#2a2a2a" strokeWidth="8" />
                                <circle
                                    cx="50" cy="50" r="40"
                                    fill="none"
                                    stroke={scoreColor}
                                    strokeWidth="8"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px", transition: "stroke-dashoffset 1s ease" }}
                                />
                            </svg>
                            <div className="score-num" style={{ color: scoreColor }}>{result.score}%</div>
                        </div>
                        <div className="score-verdict">
                            <div className="verdict-text">{result.verdict}</div>
                        </div>
                    </div>

                    <div className="two-col">
                        <div className="card">
                            <div className="card-label">Matched keywords</div>
                            <div className="tags-row">
                                {result.matched_keywords.map((k) => (
                                    <span key={k} className="tag tag-match">✓ {k}</span>
                                ))}
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-label">Missing keywords</div>
                            <div className="tags-row">
                                {result.missing_keywords.map((k) => (
                                    <span key={k} className="tag tag-miss">✗ {k}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="two-col">
                        <div className="card">
                            <div className="card-label">Gaps to address</div>
                            <ul className="analysis-list gap-list">
                                {result.gaps.map((g, i) => <li key={i}>{g}</li>)}
                            </ul>
                        </div>
                        <div className="card">
                            <div className="card-label">Your strengths</div>
                            <ul className="analysis-list strength-list">
                                {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    </div>
                </>
            )}

            <div className="phase-actions">
                <button className="btn-ghost" onClick={onBack}>← Back</button>
                <button
                    className="btn-primary"
                    onClick={() => onNext(result)}
                    disabled={!result}
                >
                    Tailor Resume →
                </button>
            </div>
        </div>
    );
}