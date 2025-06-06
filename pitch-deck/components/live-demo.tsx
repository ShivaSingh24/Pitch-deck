"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, ImageIcon, Loader2 } from "lucide-react"

export function LiveDemo() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPost, setGeneratedPost] = useState<{
    text: string
    imageUrl: string
  } | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const generatePost = async () => {
    if (!file) return

    setIsGenerating(true)

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setGeneratedPost({
      text: "🚀 Exciting news! Our latest innovation is here to transform your workflow. Discover how cutting-edge technology meets user-friendly design to deliver exceptional results. Ready to take your business to the next level? #Innovation #Technology #Business",
      imageUrl: "/placeholder.svg?height=400&width=600",
    })

    setIsGenerating(false)
  }

  return (
    <section id="demo" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Try It Live</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your file and see the magic happen in real-time
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Upload Your File</h3>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Drop your file here, or click to browse</p>
              <p className="text-sm text-gray-500 mb-4">Supports PDF and image files (PNG, JPG, JPEG)</p>

              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer">
                  Choose File
                </Button>
              </label>
            </div>

            {file && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  {file.type.includes("pdf") ? (
                    <FileText className="h-8 w-8 text-red-500 mr-3" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-blue-500 mr-3" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button onClick={generatePost} disabled={isGenerating} className="bg-blue-500 hover:bg-blue-600">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Post"
                  )}
                </Button>
              </div>
            )}
          </Card>

          {/* Preview Section */}
          <Card className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Generated Post Preview</h3>

            {!generatedPost && !isGenerating && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Upload a file to see your generated post here</p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">AI is analyzing your content...</p>
              </div>
            )}

            {generatedPost && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Generated Text:</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{generatedPost.text}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Generated Image:</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <img
                      src={generatedPost.imageUrl || "/placeholder.svg"}
                      alt="Generated marketing image"
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>

                <Button className="w-full bg-green-500 hover:bg-green-600">Download Post</Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  )
}
