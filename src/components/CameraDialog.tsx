'use client';

import { useEffect, useCallback } from 'react';
import { useCamera } from '@/hooks/useCamera';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X, SwitchCamera, Loader2 } from 'lucide-react';

interface CameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageData: string) => void;
  isAnalyzing?: boolean;
}

export function CameraDialog({
  open,
  onOpenChange,
  onCapture,
  isAnalyzing = false,
}: CameraDialogProps) {
  const {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    startCamera,
    stopCamera,
    captureImage,
    switchCamera,
    facingMode,
  } = useCamera();

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [open, startCamera, stopCamera]);

  const handleCapture = useCallback(() => {
    const imageData = captureImage();
    if (imageData) {
      onCapture(imageData);
    }
  }, [captureImage, onCapture]);

  const handleClose = useCallback(() => {
    stopCamera();
    onOpenChange(false);
  }, [stopCamera, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <span>Scan Ingredients</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="relative bg-black aspect-[3/4] w-full">
          {/* Video Preview */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Hidden Canvas for Capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Loading Overlay */}
          {!isStreaming && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Starting camera...</p>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="flex flex-col items-center gap-2 text-white text-center px-4">
                <Camera className="h-8 w-8 opacity-50" />
                <p className="text-sm text-red-400">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startCamera}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Analyzing Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="flex flex-col items-center gap-3 text-white">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
                </div>
                <p className="text-sm font-medium">Analyzing ingredients...</p>
                <p className="text-xs text-muted-foreground">This may take a moment</p>
              </div>
            </div>
          )}

          {/* Camera Frame Guides */}
          {isStreaming && !isAnalyzing && (
            <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none">
              {/* Corner guides */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-500 rounded-br-lg" />
            </div>
          )}

          {/* Switch Camera Button */}
          {isStreaming && !isAnalyzing && (
            <Button
              variant="secondary"
              size="icon"
              onClick={switchCamera}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 border-0"
            >
              <SwitchCamera className="h-5 w-5 text-white" />
            </Button>
          )}
        </div>

        {/* Capture Controls */}
        <div className="p-4 bg-background">
          <p className="text-xs text-center text-muted-foreground mb-3">
            Point your camera at your fridge or pantry
          </p>
          <Button
            onClick={handleCapture}
            disabled={!isStreaming || isAnalyzing}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold h-12"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-5 w-5" />
                Capture & Analyze
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
