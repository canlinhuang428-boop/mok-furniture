"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="th">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "60px 20px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h1 style={{ fontSize: 48, margin: "0 0 16px", color: "#1e293b" }}>😕</h1>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: "#1e293b" }}>
            ขออภัย มีปัญหาเกิดขึ้น
          </h2>
          <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: 14 }}>
            กรุณาลองรีเฟรชหน้าเว็บ หรือติดต่อแอดมิน
          </p>
          <button
            onClick={reset}
            style={{
              background: "#008AD8",
              color: "#fff",
              border: "none",
              padding: "12px 28px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ลองใหม่
          </button>
        </div>
      </body>
    </html>
  );
}
