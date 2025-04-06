import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, ArrowLeft, RotateCcw, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Scan = () => {
  const [mode, setMode] = useState<'select' | 'camera' | 'upload' | 'preview'>('select');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setMode('camera');
    } catch (err) {
      setError('Unable to access camera. Please ensure camera permissions are granted.');
      console.error('Camera access error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const image = canvas.toDataURL('image/jpeg');
      setImagePreview(image);
      stopCamera();
      setMode('preview');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/heif'].includes(file.type)) {
        setError('Please upload a valid image file (JPG, PNG, or HEIF)');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setMode('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!imagePreview) return;

    setLoading(true);
    try {
      // Here you would typically:
      // 1. Upload the image to storage
      // 2. Send to processing service
      // 3. Save results to database
      
      // Simulated processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      navigate('/dashboard/results');
    } catch (err) {
      setError('Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setImagePreview(null);
    setError(null);
    setMode('select');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <button
            onClick={() => {
              stopCamera();
              navigate('/dashboard');
            }}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-8">
        <div className="max-w-2xl mx-auto px-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {mode === 'select' && (
              <div className="p-8 space-y-6">
                <h1 className="text-2xl font-bold text-center">Scan Food Label</h1>
                <p className="text-gray-600 text-center">
                  Choose how you'd like to capture the food label
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={startCamera}
                    className="flex flex-col items-center p-6 border-2 border-dashed rounded-xl hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Camera className="w-12 h-12 text-primary mb-4" />
                    <span className="font-medium">Take Photo</span>
                    <span className="text-sm text-gray-500 mt-2">
                      Use your device's camera
                    </span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center p-6 border-2 border-dashed rounded-xl hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-primary mb-4" />
                    <span className="font-medium">Upload Image</span>
                    <span className="text-sm text-gray-500 mt-2">
                      Select from your device
                    </span>
                  </button>
                </div>
              </div>
            )}

            {mode === 'camera' && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="border-2 border-primary m-8 rounded-lg">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white text-shadow">
                      <p>Position the food label within the frame</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      stopCamera();
                      setMode('select');
                    }}
                    className="p-4 bg-white rounded-full shadow-lg"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                  <button
                    onClick={captureImage}
                    className="p-4 bg-primary rounded-full shadow-lg"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            )}

            {mode === 'preview' && imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                  <button
                    onClick={resetScan}
                    className="p-4 bg-white rounded-full shadow-lg"
                    disabled={loading}
                  >
                    <RotateCcw className="w-6 h-6 text-gray-600" />
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="p-4 bg-primary rounded-full shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-6 h-6 text-white" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/heif"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default Scan;