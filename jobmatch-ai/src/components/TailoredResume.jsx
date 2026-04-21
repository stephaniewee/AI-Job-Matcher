import { useState, useEffect } from "react";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_KEY, dangerouslyAllowBrowser: true });

export default function TailoredResume({ resumeText, job, matchResult, onBack, onRestart, onNext }) {
    const [tailored, setTailored] = useState(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState("");

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { tailorResume(); }, []);

    async function tailorResume() {
        setLoading(true);
        setError("");
        try {
            const tailorPrompt = `You are an expert resume writer.

Rewrite the following resume to better match the job description.
Rules:
- Keep the same structure and real facts — do NOT invent experience
- Improve wording to include relevant keywords from the JD
- Make bullet points stronger and more impactful
- Return the full rewritten resume as plain text only, no markdown

RESUME:
${resumeText}

JOB DESCRIPTION (${job.title} at ${job.company}):
${job.description}

MISSING KEYWORDS TO INCORPORATE (where truthful):
${matchResult?.missing_keywords?.join(", ")}`;

            const coverPrompt = `Write a concise, professional cover letter (3 short paragraphs) for this job application.
Do not use filler phrases like "I am excited to..." — be direct and specific.
Return plain text only.

CANDIDATE RESUME:
${resumeText}

JOB: ${job.title} at ${job.company}
${job.description?.slice(0, 800)}`;

            const [tailorRes, coverRes] = await Promise.all([
                groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: tailorPrompt }],
                    temperature: 0.4,
                }),
                groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: coverPrompt }],
                    temperature: 0.4,
                }),
            ]);

            setTailored(tailorRes.choices[0].message.content.trim());
            setCoverLetter(coverRes.choices[0].message.content.trim());
        } catch (err) {
            setError("Tailoring failed. Check your Groq API key or try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function copyToClipboard(text, label) {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(""), 2000);
    }

    return (
        <div className="phase-container">
            <div className="phase-header">
                <span className="phase-num">04</span>
                <div>
                    <h2>Tailored Resume</h2>
                    <p className="phase-sub">Rewritten to match {job.title} at {job.company}</p>
                </div>
            </div>

            {loading && (
                <div className="loading-state tall">
                    <div className="spinner" />
                    <p>Tailoring your resume...</p>
                    <p className="hint">Rewriting bullets + generating cover letter</p>
                </div>
            )}

            {error && (
                <div className="error-msg">
                    {error}
                    <button className="retry-btn" onClick={tailorResume}>Retry</button>
                </div>
            )}

            {tailored && !loading && (
                <>
                    <div className="card">
                        <div className="card-label-row">
                            <div className="card-label">Tailored resume <span className="ai-badge">✦ AI rewritten</span></div>
                            <button className="copy-btn" onClick={() => copyToClipboard(tailored, "resume")}>
                                {copied === "resume" ? "copied!" : "copy"}
                            </button>
                        </div>
                        <textarea
                            className="output-textarea"
                            value={tailored}
                            onChange={(e) => setTailored(e.target.value)}
                            rows={14}
                        />
                        <div className="hint" style={{ marginTop: "6px" }}>You can edit the text above before copying</div>
                    </div>

                    <div className="card">
                        <div className="card-label-row">
                            <div className="card-label">Cover letter <span className="ai-badge">✦ AI generated</span></div>
                            <button className="copy-btn" onClick={() => copyToClipboard(coverLetter, "cover")}>
                                {copied === "cover" ? "copied!" : "copy"}
                            </button>
                        </div>
                        <textarea
                            className="output-textarea"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            rows={8}
                        />
                    </div>

                    {matchResult && (
                        <div className="score-reminder">
                            Your original match score was <strong>{matchResult.score}%</strong>.
                            Apply this tailored resume to improve it significantly.
                        </div>
                    )}
                </>
            )}

            <div className="phase-actions">
                <button className="btn-ghost" onClick={onBack}>← Back</button>
                <button className="btn-ghost" onClick={tailorResume} disabled={loading}>↺ Regenerate</button>
                <button className="btn-ghost" onClick={onRestart}>+ New Job</button>
                <button className="btn-primary" onClick={onNext} disabled={!tailored}>
                    Interview Prep →
                </button>
            </div>
        </div>
    );
}