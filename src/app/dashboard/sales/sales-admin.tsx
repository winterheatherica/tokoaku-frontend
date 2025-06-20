'use client'

import { useEffect, useState } from "react"
import { getAuth } from "firebase/auth"
import axios from "axios"
import { toast } from "react-hot-toast"
import Chart from "chart.js/auto"
import "chartjs-adapter-date-fns"
import zoomPlugin from "chartjs-plugin-zoom"
import ReactMarkdown from "react-markdown"
import './page.css'

interface SalesData {
  date: string
  total_sales: number
}

interface ForecastData {
  date: string
  predicted_sales: number
}

Chart.register(zoomPlugin)

export default function SalesAdminPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [loadingPredict, setLoadingPredict] = useState(false)
  const [historicalData, setHistoricalData] = useState<SalesData[]>([])
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [analysis, setAnalysis] = useState<string>("")
  const [selectedRange, setSelectedRange] = useState("30d")

  const handleUpload = async () => {
    if (!file) return toast.error("Please choose a CSV file.")
    try {
      setLoadingUpload(true)
      const user = getAuth().currentUser
      if (!user) throw new Error("Not authenticated")

      const token = await user.getIdToken(true)
      const formData = new FormData()
      formData.append("file", file)

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/upload-sales`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )

      toast.success(res.data.message || "CSV uploaded successfully")
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.error || "Upload failed")
    } finally {
      setLoadingUpload(false)
    }
  }

  const handlePredict = async () => {
    try {
      setLoadingPredict(true)
      const user = getAuth().currentUser
      if (!user) throw new Error("Not authenticated")

      const token = await user.getIdToken(true)

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/predict-sales`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success("Prediksi berhasil dibuat!")
      await fetchCombinedData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.error || "Prediksi gagal")
    } finally {
      setLoadingPredict(false)
    }
  }

  const fetchCombinedData = async () => {
    try {
      const user = getAuth().currentUser
      if (!user) throw new Error("Not authenticated")

      const token = await user.getIdToken(true)

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/sales-forecast-history`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setHistoricalData(res.data.historical)
      setForecastData(res.data.forecast)
      setAnalysis(res.data.analysis)
    } catch (err: any) {
      console.error("Error fetching chart data:", err)
      toast.error("Gagal mengambil data chart.")
    }
  }

  useEffect(() => {
    fetchCombinedData()
  }, [])

  useEffect(() => {
    if (historicalData.length === 0 && forecastData.length === 0) return

    const ctx = document.getElementById("salesChart") as HTMLCanvasElement
    if (!ctx) return
    Chart.getChart(ctx)?.destroy()

    const filteredHistorical = filterData(historicalData, selectedRange)

    new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Penjualan Aktual",
            data: filteredHistorical.map((d) => ({
              x: d.date,
              y: d.total_sales,
            })),
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            tension: 0.3,
            pointRadius: 3,
            borderWidth: 2,
          },
          {
            label: "Prediksi",
            data: forecastData.map((d) => ({
              x: d.date,
              y: d.predicted_sales,
            })),
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            tension: 0.3,
            pointRadius: 3,
            borderWidth: 2,
            borderDash: [5, 5],
          },
        ],
      },
      options: {
        responsive: true,
        animation: {
          duration: 1000,
          easing: "easeOutQuart",
        },
        interaction: {
          mode: "nearest",
          intersect: true,
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const raw = ctx.raw as { y: number }
                const value = raw.y ?? 0
                return `Tanggal: ${ctx.label}\nPenjualan: Rp${value.toLocaleString()}`
              },
            },
          },
          legend: {
            display: true,
          },
          title: {
            display: true,
            text: "Grafik Penjualan & Prediksi",
          },
          zoom: {
            pan: { enabled: true, mode: "xy" },
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: "xy",
            },
          },
        },
        scales: {
          x: {
            type: "time",
            time: { unit: "day", tooltipFormat: "PPP" },
            title: { display: true, text: "Tanggal" },
          },
          y: {
            title: { display: true, text: "Penjualan (Rp)" },
          },
        },
      },
    })
  }, [historicalData, forecastData, selectedRange])

  const filterData = (data: SalesData[], range: string): SalesData[] => {
    const now = new Date()
    const cutoff = new Date(now)
    cutoff.setHours(0, 0, 0, 0)

    switch (range) {
      case "7d":
        cutoff.setDate(cutoff.getDate() - 7)
        break
      case "30d":
        cutoff.setDate(cutoff.getDate() - 30)
        break
      case "3m":
        cutoff.setMonth(cutoff.getMonth() - 3)
        break
      case "6m":
        cutoff.setMonth(cutoff.getMonth() - 6)
        break
      case "1y":
        cutoff.setFullYear(cutoff.getFullYear() - 1)
        break
    }

    const maxDaysMap: Record<string, number> = {
      "7d": 7,
      "30d": 30,
      "3m": 90,
      "6m": 180,
      "1y": 365,
    }

    const maxUniqueDays = maxDaysMap[range] ?? Infinity

    const sorted = data
      .map((d) => ({ ...d, _date: new Date(d.date) }))
      .sort((a, b) => a._date.getTime() - b._date.getTime())

    const seenDates = new Set<string>()
    const result: SalesData[] = []

    for (let i = sorted.length - 1; i >= 0; i--) {
      const d = sorted[i]
      const day = d._date.toISOString().split("T")[0]
      if (d._date >= cutoff) {
        if (!seenDates.has(day)) {
          seenDates.add(day)
        }
        result.unshift({ date: d.date, total_sales: d.total_sales })
        if (seenDates.size >= maxUniqueDays) break
      }
    }

    return result
  }

  return (
    <div className="salesPageWrapper">
      <h2>Upload Sales CSV</h2>

      <input
        type="file"
        accept=".csv"
        id="csvInput"
        style={{ display: "none" }}
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <div className="uploadGroup">
        <label htmlFor="csvInput" className="salesButton uploadButton">
          {file ? `Dipilih: ${file.name}` : "Pilih File CSV"}
        </label>

        <button
          className="salesButton uploadButton"
          onClick={handleUpload}
          disabled={loadingUpload}
        >
          {loadingUpload ? "Uploading..." : "Upload CSV"}
        </button>
      </div>

      <h2>Prediksi Penjualan</h2>
      <button
        className="salesButton"
        onClick={handlePredict}
        disabled={loadingPredict}
      >
        {loadingPredict ? "Memproses..." : "Mulai Prediksi"}
      </button>

      <div style={{ marginTop: 24 }}>
        <label htmlFor="range">Rentang Waktu: </label>
        <select
          id="range"
          value={selectedRange}
          onChange={(e) => setSelectedRange(e.target.value)}
        >
          <option value="7d">7 Hari Terakhir</option>
          <option value="30d">30 Hari Terakhir</option>
          <option value="3m">3 Bulan Terakhir</option>
          <option value="6m">6 Bulan Terakhir</option>
          <option value="1y">1 Tahun Terakhir</option>
        </select>
      </div>

      <h2>Visualisasi Penjualan</h2>
      <canvas id="salesChart" height={100}></canvas>

      <div className="salesAnalysis">
        <ReactMarkdown>{analysis}</ReactMarkdown>
      </div>
    </div>
  )
}
