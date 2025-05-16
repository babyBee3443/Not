// src/app/scan-question/page.tsx
"use client";

import * as React from 'react';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { Camera, ImageUp, RefreshCcw, ScanSearch, CheckCircle, XCircle, VideoOff } from 'lucide-react';
import Image from 'next/image';
import { ScrollToTopButton } from '@/components/scroll-to-top-button';

type Mode = 'select' | 'camera' | 'upload' | 'preview';

export default function ScanQuestionPage() {
  const [mode, setMode] = React.useState<Mode>('select');
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [isProcessingAi, setIsProcessingAi] = React.useState(false); // For future AI call
  const [error, setError] = React.useState<string | null>(null);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (mode === 'camera') {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error('Kamera erişim hatası:', err);
          setHasCameraPermission(false);
          setError("Kamera izni reddedildi veya kamera bulunamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.");
          toast({
            variant: 'destructive',
            title: 'Kamera Erişimi Reddedildi',
            description: 'Lütfen bu özelliği kullanmak için kamera izinlerini etkinleştirin.',
          });
        }
      };
      getCameraPermission();

      // Cleanup function to stop camera stream when component unmounts or mode changes
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [mode, toast]);

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageSrc(dataUrl);
        setMode('preview');
        // Stop camera tracks after capture
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
      } else {
        setError("Fotoğraf çekilemedi. Lütfen tekrar deneyin.");
        toast({variant: "destructive", title: "Hata", description: "Fotoğraf çekilemedi."})
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
        setMode('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetakeOrUploadAnother = () => {
    setImageSrc(null);
    setError(null);
    setMode('select');
    if (fileInputRef.current) { // Reset file input
        fileInputRef.current.value = "";
    }
  };

  const handleScanWithAi = async () => {
    if (!imageSrc) return;
    setIsProcessingAi(true);
    setError(null);
    // TODO: Implement AI call in Phase 2
    toast({ title: "Yapay Zeka İşlevi Henüz Aktif Değil", description: "Bu özellik yakında eklenecektir." });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing
    setIsProcessingAi(false);
    // For now, let's just stay in preview mode or go back to select
    // setMode('select'); 
    // setImageSrc(null);
  };
  
  const renderContent = () => {
    switch (mode) {
      case 'select':
        return (
          <div className="space-y-4">
             <div className="text-center mb-8">
                <ScanLine className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-primary">Soru Tara ve Çözdür</h1>
                <p className="text-muted-foreground mt-2">
                  Biyoloji sorunuzun fotoğrafını çekin veya galeriden yükleyin, yapay zeka sizin için çözsün ve açıklasın!
                </p>
              </div>
            <Button onClick={() => setMode('camera')} className="w-full text-lg py-6" variant="default">
              <Camera className="mr-2 h-6 w-6" /> Kamerayı Kullan
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} className="w-full text-lg py-6" variant="secondary">
              <ImageUp className="mr-2 h-6 w-6" /> Galeriden Yükle
            </Button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        );
      case 'camera':
        if (hasCameraPermission === false) {
           return (
            <div className="space-y-4">
              <Alert variant="destructive">
                <VideoOff className="h-4 w-4" />
                <AlertTitle>Kamera Erişimi Sorunu</AlertTitle>
                <AlertDescription>
                  {error || "Kamera kullanılamıyor. Lütfen tarayıcı izinlerinizi kontrol edin."}
                </AlertDescription>
              </Alert>
              <Button onClick={() => setMode('select')} variant="outline" className="w-full">
                Geri Dön
              </Button>
            </div>
          );
        }
        return (
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-full max-w-md aspect-[3/4] bg-muted rounded-lg overflow-hidden shadow-lg">
                 <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            </div>
            <canvas ref={canvasRef} className="hidden" /> {/* Hidden canvas for capture */}
            <Button onClick={handleCaptureImage} className="w-full max-w-md text-lg py-3">
              <CheckCircle className="mr-2 h-5 w-5" /> Fotoğraf Çek
            </Button>
            <Button onClick={() => setMode('select')} variant="outline" className="w-full max-w-md">
               <XCircle className="mr-2 h-5 w-5" /> İptal
            </Button>
          </div>
        );
      case 'upload': // This mode is implicitly handled by clicking the "Galeriden Yükle" button
        return null; 
      case 'preview':
        return (
          <div className="space-y-6 flex flex-col items-center">
            {imageSrc && (
              <div className="w-full max-w-md border-2 border-primary rounded-lg overflow-hidden shadow-xl">
                 <Image src={imageSrc} alt="Taranan Soru" width={500} height={700} className="object-contain w-full h-auto" />
              </div>
            )}
            <Button onClick={handleScanWithAi} className="w-full max-w-md text-lg py-3" disabled={isProcessingAi}>
              {isProcessingAi ? (
                 <> <ScanSearch className="mr-2 h-5 w-5 animate-ping" /> İşleniyor...</>
              ) : (
                 <> <ScanSearch className="mr-2 h-5 w-5" /> Bu Soruyu Tara</>
              )}
            </Button>
            <Button onClick={handleRetakeOrUploadAnother} variant="outline" className="w-full max-w-md" disabled={isProcessingAi}>
              <RefreshCcw className="mr-2 h-5 w-5" /> Yeniden Çek / Başka Yükle
            </Button>
            {error && (
                <Alert variant="destructive" className="w-full max-w-md">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Hata</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="container mx-auto py-8 px-4 md:px-6 lg:px-8 flex-1">
        <div className="mx-auto max-w-xl space-y-8">
          {renderContent()}
        </div>
      </main>
      <ScrollToTopButton />
    </div>
  );
}
