import { useState, useRef } from "react";

export default function ResumeUpload({ onResumeReady }) {
    const [mode, setMode] = useState("upload");
    const [resumeText, setResumeText] = useState("");
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef();

    async function extractPdfText(file) {
        setLoading(true);
        setError("");
        try {
            const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
            pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items.map((item) => item.str).join(" ");
                fullText += pageText + "\n";
            }
            setResumeText(fullText.trim());
            setFileName(file.name);
        } catch (err) {
            console.error(err);
            setError("Could not read PDF. Try pasting your resume text instead.");
        } finally {
            setLoading(false);
        }
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            extractPdfText(file);
        } else {
            setError("Please upload a PDF file.");
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) extractPdfText(file);
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleNext() {
        const text = resumeText.trim();
        if (!text) {
            setError("Please upload a PDF or paste your resume text first.");
            return;
        }
        onResumeReady(text); // pass resume text up to App
    }

    return (
        <div className="phase-container">
            <div className="phase-header">
                <span className="phase-num">01</span>
                <div>
                    <h2>Upload your resume</h2>
                    <p className="phase-sub">PDF upload or paste — your data never leaves your browser</p>
                </div>
            </div>

            {/* Toggle between upload and paste */}
            <div className="mode-toggle">
                <button
                    className={mode === "upload" ? "toggle-btn active" : "toggle-btn"}
                    onClick={() => setMode("upload")}
                >
                    Upload PDF
                </button>
                <button
                    className={mode === "paste" ? "toggle-btn active" : "toggle-btn"}
                    onClick={() => setMode("paste")}
                >
                    Paste Text
                </button>
            </div>

            {mode === "upload" ? (
                <div
                    className={`upload-zone ${loading ? "loading" : ""} ${fileName ? "has-file" : ""}`}
                    onClick={() => !loading && fileRef.current.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <input
                        type="file"
                        ref={fileRef}
                        accept=".pdf"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                    {loading ? (
                        <div className="upload-state">
                            <div className="spinner" />
                            <p>Reading your PDF...</p>
                        </div>
                    ) : fileName ? (
                        <div className="upload-state success">
                            <span className="upload-icon">✓</span>
                            <p><strong>{fileName}</strong></p>
                            <p className="hint">Click to replace</p>
                        </div>
                    ) : (
                        <div className="upload-state">
                            <span className="upload-icon">↑</span>
                            <p>Drop your PDF here or <strong>click to browse</strong></p>
                            <p className="hint">Only .pdf files are supported</p>
                        </div>
                    )}
                </div>
            ) : (
                <textarea
                    className="resume-textarea"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder={`Paste your resume text here...\n\nJohn Doe\njohn@email.com | github.com/johndoe\n\nSkills: React, Python, SQL...\n\nExperience:\n...`}
                    rows={14}
                />
            )}

            {/* Preview extracted text when PDF is uploaded */}
            {mode === "upload" && resumeText && (
                <div className="text-preview">
                    <div className="preview-label">Extracted text preview</div>
                    <pre>{resumeText.slice(0, 400)}...</pre>
                </div>
            )}

            {error && <div className="error-msg">{error}</div>}

            <div className="phase-actions">
                <button
                    className="btn-primary"
                    onClick={handleNext}
                    disabled={!resumeText.trim() || loading}
                >
                    Next: Search Jobs →
                </button>
            </div>
        </div>
    );
}