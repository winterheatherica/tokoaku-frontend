"use client";

import { useState } from "react";

type Review = {
    id: number;
    text: string;
    rating: number;
    created_at: string;
    customer: {
        full_name: string;
    };
    sentiment?: {
        name: string;
    };
};

export default function ReviewByVariantPage() {
    const [variantID, setVariantID] = useState("");
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchReviews = async () => {
        if (!variantID) return;

        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/reviews-by-variant?variant_id=${variantID}`
            );
            const data = await res.json();
            
            if (!res.ok) {
                setError(data.error || "Gagal mengambil review");
                setReviews([]);
            } else {
                setReviews(data.reviews);
            }
        } catch (err: any) {
            setError("Terjadi kesalahan saat mengambil review.");
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
            <h1>Review Produk Berdasarkan Variant</h1>

            <input
                type="text"
                placeholder="Masukkan Product Variant ID"
                value={variantID}
                onChange={(e) => setVariantID(e.target.value)}
                style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginBottom: "1rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                }}
            />

            <button
                onClick={fetchReviews}
                disabled={loading}
                style={{
                    backgroundColor: "#3AAFA9",
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                {loading ? "Loading..." : "Lihat Review"}
            </button>

            {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

            {reviews.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                    <h2>{reviews.length} Review Ditemukan</h2>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {reviews.map((r) => (
                            <li
                                key={r.id}
                                style={{
                                    borderBottom: "1px solid #ddd",
                                    padding: "1rem 0",
                                }}
                            >
                                <strong>{r.customer?.full_name || "Anonim"}</strong> – Rating: {r.rating}/5
                                <br />
                                <i>({new Date(r.created_at).toLocaleString()})</i>
                                <br />
                                {r.sentiment?.name && (
                                    <span>Sentimen: {r.sentiment.name}</span>
                                )}
                                <p style={{ marginTop: "0.5rem" }}>{r.text}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
