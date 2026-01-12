"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  CheckCircle2,
  Shield,
  Loader2,
  FileText,
  Zap,
  AlertCircle,
  Moon,
  Sun,
  Sparkles,
  Copy,
  Download,
  BarChart3,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  Tooltip,
  Legend,
} from "recharts"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const SPAM_EXAMPLES = [
  {
    label: "Ganador de Premio",
    text: "CONGRATULATIONS! You've WON $1,000,000! Click here NOW to claim your prize! Limited time offer! Act fast! FREE money waiting!",
  },
  {
    label: "Oferta Urgente",
    text: "URGENT! Your account will be suspended! Click here immediately to verify your information and avoid account closure!",
  },
  {
    label: "Email Legítimo",
    text: "Hi team, I wanted to follow up on our meeting yesterday. Could you please send me the project timeline we discussed? Thanks!",
  },
]

interface AnalysisResult {
  prediction: "spam" | "ham" | "error"
  confidence: number
  latency: number
  cleaned_text?: string
  filename?: string
  error?: string
  spam_keywords?: string[]
  spam_probability?: number
  ham_probability?: number
}

export default function SpamDetectorPage() {
  const [message, setMessage] = useState("")
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState<"text" | "file">("text")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileResult, setFileResult] = useState<AnalysisResult | null>(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [fileTextContent, setFileTextContent] = useState<string | null>(null)

  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const analyzeMessage = async () => {
    if (!message.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_text: message }),
      })

      if (!response.ok) {
        throw new Error("Error al analizar el mensaje")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const analyzeFile = async () => {
    if (!selectedFile) return

    setFileLoading(true)
    setFileError(null)
    setFileResult(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch(`${API_BASE_URL}/api/analyze-file/`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al analizar el archivo")
      }

      const data = await response.json()
      setFileResult(data)
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setFileLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileResult(null)
      setFileError(null)
      readFileContent(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileResult(null)
      setFileError(null)
      readFileContent(file)
    }
  }

  const readFileContent = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setFileTextContent(text)
    }
    reader.onerror = () => {
      setFileError("Error al leer el archivo")
      setFileTextContent(null)
    }
    reader.readAsText(file)
  }

  const loadExample = (exampleText: string) => {
    setMessage(exampleText)
    setResult(null)
    setError(null)
  }

  const copyToClipboard = () => {
    if (currentResult) {
      const text = `Resultado: ${currentResult.prediction.toUpperCase()}\nConfianza: ${currentResult.confidence}%\nPalabras spam: ${currentResult.spam_keywords?.join(", ") || "N/A"}`
      navigator.clipboard.writeText(text)
    }
  }

  const exportResults = () => {
    if (currentResult) {
      const data = {
        timestamp: new Date().toISOString(),
        message: currentMessageText.substring(0, 100) + "...",
        prediction: currentResult.prediction,
        confidence: currentResult.confidence,
        spam_keywords: currentResult.spam_keywords,
        latency: currentResult.latency,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `spam-analysis-${Date.now()}.json`
      a.click()
    }
  }

  const currentResult = inputMode === "text" ? result : fileResult
  const currentError = inputMode === "text" ? error : fileError
  const currentLoading = inputMode === "text" ? loading : fileLoading
  const currentMessageText = inputMode === "text" ? message : fileTextContent || ""
  const characterCount = currentMessageText.length
  const wordCount = currentMessageText.trim().split(/\s+/).filter(Boolean).length

  const scoreChartData =
    currentResult && currentResult.prediction === "spam"
      ? [
          {
            name: "SPAM",
            value: currentResult.spam_probability || currentResult.confidence,
            fill: "#ef4444",
          },
          {
            name: "HAM",
            value: currentResult.ham_probability || 100 - currentResult.confidence,
            fill: "#10b981",
          },
        ]
      : []

  const radialData = currentResult
    ? [
        {
          name: currentResult.prediction === "spam" ? "SPAM" : "HAM",
          value: currentResult.confidence,
          fill: currentResult.prediction === "spam" ? "#ef4444" : "#10b981",
        },
      ]
    : []

  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      <div className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 text-primary-foreground py-8 px-4 shadow-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xl shadow-lg border border-white/20">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Detector de SPAM </h1>
                <p className="text-sm md:text-base opacity-90 mt-1">Análisis avanzado con Machine Learning</p>
              </div>
            </div>
            <Button
              onClick={() => setDarkMode(!darkMode)}
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur">Regresión Logística</Badge>
            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur">CountVectorizer</Badge>
            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur">Dataset TREC07p</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Card className="shadow-lg border-border bg-card">
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-card-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Prueba Rápida con Ejemplos
            </h3>
            <div className="flex flex-wrap gap-3">
              {SPAM_EXAMPLES.map((example, idx) => (
                <Button
                  key={idx}
                  onClick={() => loadExample(example.text)}
                  variant="outline"
                  className="hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  {example.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <Card className="shadow-xl border-border bg-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Analizar Email
                  </h2>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-sm">
                      {characterCount} caracteres
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      {wordCount} palabras
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  <Button
                    onClick={() => setInputMode("text")}
                    variant={inputMode === "text" ? "default" : "outline"}
                    size="lg"
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Texto
                  </Button>
                  <Button
                    onClick={() => setInputMode("file")}
                    variant={inputMode === "file" ? "default" : "outline"}
                    size="lg"
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Archivo
                  </Button>
                </div>

                {inputMode === "text" && (
                  <div className="space-y-4">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={16}
                      className="w-full border-2 focus:border-primary rounded-lg bg-background text-foreground"
                      placeholder="Pega aquí el contenido del email para analizar..."
                    />
                    <Button
                      onClick={analyzeMessage}
                      disabled={loading || !message.trim()}
                      className="w-full bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analizando...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Analizar Texto
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {inputMode === "file" && (
                  <div className="space-y-4">
                    <div
                      className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary hover:bg-accent/50 transition-all cursor-pointer"
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => document.getElementById("emailFile")?.click()}
                    >
                      <input type="file" id="emailFile" className="hidden" onChange={handleFileChange} />
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-semibold text-card-foreground">Arrastra o haz clic para subir</p>
                      <p className="text-sm text-muted-foreground mt-2">Archivos .txt o .eml</p>
                    </div>

                    {selectedFile && (
                      <div className="space-y-4">
                        <div className="p-4 bg-accent rounded-lg border border-border">
                          <p className="font-medium text-card-foreground">
                            Archivo: <span className="text-primary">{selectedFile.name}</span>
                          </p>
                        </div>

                        {fileTextContent && (
                          <div>
                            <label className="block text-sm font-medium mb-2 text-card-foreground">Vista previa:</label>
                            <Textarea
                              value={fileTextContent}
                              readOnly
                              rows={8}
                              className="w-full border-2 bg-muted/50 font-mono text-sm"
                            />
                          </div>
                        )}

                        <Button
                          onClick={analyzeFile}
                          disabled={fileLoading}
                          className="w-full bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
                          size="lg"
                        >
                          {fileLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Analizando...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-5 w-5" />
                              Analizar Archivo
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {currentError && (
                  <Card className="border-l-4 border-destructive bg-destructive/10 mt-4">
                    <div className="p-4 flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      <div className="text-sm text-destructive">{currentError}</div>
                    </div>
                  </Card>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {currentResult ? (
              <>
                <Card
                  className={`border-l-4 shadow-2xl ${
                    currentResult.prediction === "spam"
                      ? "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-500"
                      : "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-500"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {currentResult.prediction === "spam" ? (
                          <div className="bg-red-500 p-4 rounded-2xl shadow-lg">
                            <AlertTriangle className="h-8 w-8 text-white" />
                          </div>
                        ) : (
                          <div className="bg-green-500 p-4 rounded-2xl shadow-lg">
                            <CheckCircle2 className="h-8 w-8 text-white" />
                          </div>
                        )}
                        <div>
                          <div
                            className={`font-bold text-2xl md:text-3xl ${
                              currentResult.prediction === "spam"
                                ? "text-red-700 dark:text-red-400"
                                : "text-green-700 dark:text-green-400"
                            }`}
                          >
                            {currentResult.prediction === "spam" ? "SPAM DETECTADO" : "EMAIL LEGÍTIMO"}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {currentResult.prediction === "spam"
                              ? "Este mensaje ha sido clasificado como spam"
                              : "Este mensaje parece ser legítimo"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <Button onClick={copyToClipboard} variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                      <Button onClick={exportResults} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Exportar
                      </Button>
                    </div>

                    <div className="bg-card rounded-xl p-4 shadow-md">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2 text-center">
                        Nivel de Confianza
                      </h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="90%"
                            data={radialData}
                            startAngle={180}
                            endAngle={0}
                          >
                            <RadialBar
                              dataKey="value"
                              cornerRadius={10}
                              label={{
                                position: "center",
                                fill: darkMode ? "#e2e8f0" : "#1e293b",
                                fontSize: 32,
                                fontWeight: "bold",
                                formatter: (value: number) => `${value.toFixed(1)}%`,
                              }}
                            />
                          </RadialBarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="text-center mt-2 text-xs text-muted-foreground">
                        Tiempo de análisis: {currentResult.latency.toFixed(2)}ms
                      </div>
                    </div>
                  </div>
                </Card>

                {currentResult.prediction === "spam" && (
                  <>
                    <Card className="shadow-xl border-2 border-red-200 dark:border-red-900 bg-card">
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-card-foreground">
                          <BarChart3 className="h-5 w-5 text-red-500" />
                          Análisis de Probabilidad
                        </h3>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scoreChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e2e8f0"} />
                              <XAxis
                                dataKey="name"
                                stroke={darkMode ? "#94a3b8" : "#64748b"}
                                fontSize={14}
                                fontWeight="bold"
                              />
                              <YAxis stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={12} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: darkMode ? "#1e293b" : "#fff",
                                  border: "2px solid",
                                  borderColor: darkMode ? "#334155" : "#e2e8f0",
                                  borderRadius: "8px",
                                  color: darkMode ? "#e2e8f0" : "#1e293b",
                                }}
                                formatter={(value: number) => `${value.toFixed(1)}%`}
                              />
                              <Legend />
                              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </Card>

                    {currentResult.spam_keywords && currentResult.spam_keywords.length > 0 && (
                      <Card className="shadow-xl border-2 border-red-200 dark:border-red-900 bg-card">
                        <div className="p-6">
                          <h3 className="font-bold text-lg mb-4 flex items-center justify-between text-card-foreground">
                            <span className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              Palabras Sospechosas Detectadas
                            </span>
                            <Badge variant="destructive" className="text-sm">
                              {currentResult.spam_keywords.length} palabras
                            </Badge>
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {currentResult.spam_keywords.map((keyword, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800 px-3 py-1.5 text-sm font-medium"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-4">
                            Estas palabras contribuyeron a la clasificación como spam
                          </p>
                        </div>
                      </Card>
                    )}
                  </>
                )}
              </>
            ) : (
              <Card className="shadow-xl border-2 border-border bg-card">
                <div className="p-12 text-center">
                  <Shield className="h-20 w-20 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold text-xl mb-2 text-card-foreground">Esperando análisis</h3>
                  <p className="text-muted-foreground">Ingresa un email o carga un archivo para comenzar el análisis</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
