"use client";

import React, { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadImage } from "../../../lib/api/uploadApi";
import { toast } from "react-toastify";


interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: (url: string) => void;
}

export default function ImageUploadModal({ isOpen, onClose, onUploadSuccess }: ImageUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setError(null);
        if (selectedFile) {
            if (!selectedFile.type.startsWith("image/")) {
                setError("Please select an image file.");
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError("File size should be less than 5MB.");
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const data = await uploadImage(file);
            toast.success("Image uploaded successfully!");
            setTimeout(() => {
                onUploadSuccess(data.url);
                resetAndClose();
            }, 1000);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to upload image. Please try again.";
            setError(message);
        } finally {
            setUploading(false);
        }
    };

    const resetAndClose = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-50 dark:border-gray-800">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                        <Upload className="h-5 w-5 mr-2 text-blue-500" />
                        Upload Image
                    </h3>
                    <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors font-bold text-black dark:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {!preview ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group"
                        >
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                                <ImageIcon className="h-8 w-8 text-blue-500" />
                            </div>
                            <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                                Click or drag to upload image
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                PNG, JPG or WEBP (Max 5MB)
                            </p>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                                onClick={() => { setFile(null); setPreview(null); }}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}


                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-50 dark:border-gray-800 flex gap-3">
                    <button 
                        onClick={resetAndClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : "Upload"}
                    </button>
                </div>
            </div>
        </div>
    );
}
