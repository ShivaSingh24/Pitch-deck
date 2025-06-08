"use client";

import type React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, FileText, ImageIcon, Loader2 } from "lucide-react";

export function LiveDemo() {
  // State declarations
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<{
    text: string;
    imageUrl: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Upload file to Cloudinary as soon as it's selected or dropped
  useEffect(() => {
    if (file && !pdfUrl && !isUploading) {
      uploadFile();
    }
  }, [file]);

  const uploadFile = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setPdfUrl(data.url);
      console.log("PDF URL:", data.url);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setPdfUrl(null); // Reset pdfUrl for new upload
      } else {
        alert("Please upload a PDF file.");
      }
    }
  }, []);

  // Handle file selection from explorer
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setPdfUrl(null); // Reset pdfUrl for new upload
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  // Open file explorer
  const openFileExplorer = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Send PDF URL and user query to the generate endpoint
  const generatePost = async () => {
    if (!pdfUrl || !userQuery) return;

    setIsGenerating(true);

    const formData = new FormData();
    formData.append("pdf_url", pdfUrl);
    formData.append("user_query", userQuery);


    // Print each key-value pair
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    
    
    try {
      const response = await fetch("http://localhost:8002/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate post");
      }

      const data = await response.json();
      console.log(data)
      setGeneratedPost({
        text: data.response,
        imageUrl: data.image_url,
      });
    } catch (error) {
      console.error("Error generating post:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section id="demo" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Try It Live
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your PDF, enter your query, and see the magic happen in
            real-time
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Upload Your PDF
            </h3>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your PDF here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">Supports PDF files</p>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                ref={fileInputRef}
              />
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={openFileExplorer}
              >
                Choose File
              </Button>
            </div>

            {/* File Info and Upload Status */}
            {file && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-red-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {isUploading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : pdfUrl ? (
                  <span className="text-green-500">Uploaded</span>
                ) : null}
              </div>
            )}

            {/* Query Input and Generate Button */}
            {pdfUrl && (
              <div className="mt-6">
                <label
                  htmlFor="user-query"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter your query
                </label>
                <Input
                  id="user-query"
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="E.g., Create a Marketing Campaign etc."
                  className="mt-1 block w-full"
                />
                <Button
                  onClick={generatePost}
                  disabled={isGenerating || !userQuery}
                  className="mt-2 w-full bg-[#c54dd8] hover:bg-[#a83fba]"
                >
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
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Generated Post Preview
            </h3>

            {!generatedPost && !isGenerating && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  Upload a PDF and enter a query to see your generated post here
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">AI is generating your post...</p>
              </div>
            )}

            {generatedPost && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Generated Text:
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">
                      {generatedPost.text}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Generated Image:
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <img
                      src={generatedPost.imageUrl || "/placeholder.svg"}
                      alt="Generated marketing image"
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>

                <Button className="w-full bg-green-500 hover:bg-green-600">
                  Download Post
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
