// src/app/scan-question/page.tsx
"use client";

import * as React from 'react';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Camera, ImageUp, RefreshCcw, ScanSearch, CheckCircle, XCircle, VideoOff, Loader2, Lightbulb, MessageSquare, HelpCircleIcon } from 'lucide-react';
import Image from 'next/image';
import { ScrollToTopButton } from '@/components/scroll-to-top-button';
import { solveImageQuestion, type SolveImageQuestionOutput } from '@/ai/flows/solve-image-question-flow';
import { Textarea } from '@/components/ui/textarea';

type Mode = 'select' | 'camera' | 'upload' | 'preview' | 'results';

export default function ScanQuestionPage() {
  const [mode, setMode] = React.useState<Mode>('select');
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [isProcessingAi, setIsProcessingAi] = React.useState(false);
  const [aiResults, setAiResults] = React.useState<SolveImageQuestionOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = React.useState(false);
  const [feedbackText, setFeedbackText] = React.useState('');
  
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

            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
              const track = videoTracks[0];
              if (typeof track.getCapabilities === 'function') {
                const capabilities = track.getCapabilities();
                if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
                  track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] })
                    .then(() => console.log("Sürekli otomatik netleme modu uygulandı."))
                    .catch(e => console.warn("Sürekli otomatik netleme modu uygulanamadı:", e));
                } else {
                  console.log("Sürekli otomatik netleme bu kamera/tarayıcı tarafından desteklenmiyor.");
                }
              } else {
                console.log("track.getCapabilities() bu tarayıcı tarafından desteklenmiyor.");
              }
            }
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
        setAiResults(null); 
        setError(null);
        setShowFeedbackForm(false);
        setFeedbackText('');
        setMode('preview');
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
        setAiResults(null); 
        setError(null);
        setShowFeedbackForm(false);
        setFeedbackText('');
        setMode('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetakeOrUploadAnother = () => {
    setImageSrc(null);
    setError(null);
    setAiResults(null);
    setShowFeedbackForm(false);
    setFeedbackText('');
    setMode('select');
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleScanWithAi = async () => {
    if (!imageSrc) return;
    setIsProcessingAi(true);
    setError(null);
    setAiResults(null);
    setShowFeedbackForm(false);
    setFeedbackText('');

    try {
      const result = await solveImageQuestion({ imageDataUri: imageSrc });
      setAiResults(result);
      if (result.isBiologyQuestion) {
        setError(null); 
        toast({ title: "Soru Çözüldü!", description: "Yapay zeka sorunuzu analiz etti ve çözüm üretti." });
        setMode('results');
      } else {
        setError(result.explanation || "Görüntü bir biyoloji sorusu olarak tanımlanamadı.");
        toast({ title: "Soru Tanımlanamadı", description: result.explanation || "Lütfen net bir biyoloji sorusu içeren bir görüntü yükleyin.", variant: "default" });
        setMode('preview'); 
      }
    } catch (err) {
      console.error("AI Soru Çözme Hatası:", err);
      const errorMessage = err instanceof Error ? err.message : "Soru işlenirken bilinmeyen bir hata oluştu.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Yapay Zeka Hatası", description: errorMessage });
      setMode('preview'); 
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleToggleFeedbackForm = () => {
    setShowFeedbackForm(prev => !prev);
    if (showFeedbackForm) setFeedbackText('');
  };

  const handleFeedbackSubmit = () => {
    console.log("Kullanıcı Geri Bildirimi:", {
      image: imageSrc ? imageSrc.substring(0, 50) + "..." : "Yok",
      aiResponse: aiResults,
      feedback: feedbackText
    });
    toast({
      title: "Geri Bildirim Alındı",
      description: "Değerli geri bildiriminiz için teşekkür ederiz!",
    });
    setFeedbackText('');
    setShowFeedbackForm(false);
  };
  
  const renderContent = () => {
    switch (mode) {
      case 'select':
        return (
          <div className="space-y-4">
             <div className="text-center mb-8">
                <ScanSearch className="h-16 w-16 text-primary mx-auto mb-4" />
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
            <canvas ref={canvasRef} className="hidden" />
            {hasCameraPermission === null && ( 
                 <Alert variant="default" className="mt-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertTitle>Kamera İzni İsteniyor</AlertTitle>
                    <AlertDescription>
                        Kameranıza erişmek için tarayıcınız sizden izin isteyebilir. Lütfen izin verin.
                    </AlertDescription>
                </Alert>
            )}
            {hasCameraPermission && (
                <Button onClick={handleCaptureImage} className="w-full max-w-md text-lg py-3">
                    <CheckCircle className="mr-2 h-5 w-5" /> Fotoğraf Çek
                </Button>
            )}
            <Button onClick={() => setMode('select')} variant="outline" className="w-full max-w-md">
               <XCircle className="mr-2 h-5 w-5" /> İptal
            </Button>
             {hasCameraPermission === false && !error && ( 
                 <Alert variant="destructive">
                    <VideoOff className="h-4 w-4" />
                    <AlertTitle>Kamera Erişimi Gerekli</AlertTitle>
                    <AlertDescription>
                        Bu özelliği kullanmak için lütfen kamera erişimine izin verin. Ayarlardan izin verdikten sonra sayfayı yenileyebilirsiniz.
                    </AlertDescription>
                </Alert>
            )}
          </div>
        );
      case 'preview':
        return (
          <div className="space-y-6 flex flex-col items-center">
            {imageSrc && (
              <div className="w-full max-w-md border-2 border-primary rounded-lg overflow-hidden shadow-xl">
                 <Image src={imageSrc} alt="Taranan Soru" width={500} height={700} className="object-contain w-full h-auto" data-ai-hint="question scan" />
              </div>
            )}
            <Button onClick={handleScanWithAi} className="w-full max-w-md text-lg py-3" disabled={isProcessingAi || !imageSrc}>
              {isProcessingAi ? (
                 <> <Loader2 className="mr-2 h-5 w-5 animate-spin" /> İşleniyor...</>
              ) : (
                 <> <ScanSearch className="mr-2 h-5 w-5" /> Bu Soruyu Tara</>
              )}
            </Button>
            <Button onClick={handleRetakeOrUploadAnother} variant="outline" className="w-full max-w-md" disabled={isProcessingAi}>
              <RefreshCcw className="mr-2 h-5 w-5" /> Yeniden Çek / Başka Yükle
            </Button>
            {error && ( 
                <Alert 
                  variant={(aiResults && !aiResults.isBiologyQuestion) || (error && (error.includes("tanımlanamadı") || error.includes("algılanamadı") || error.includes("içermiyor") )) ? "default" : "destructive"} 
                  className="w-full max-w-md"
                >
                    {(aiResults && !aiResults.isBiologyQuestion) || (error && (error.includes("tanımlanamadı") || error.includes("algılanamadı") || error.includes("içermiyor") ))
                        ? <HelpCircleIcon className="h-4 w-4" /> 
                        : <XCircle className="h-4 w-4" />}
                    <AlertTitle>
                        {(aiResults && !aiResults.isBiologyQuestion) || (error && (error.includes("tanımlanamadı") || error.includes("algılanamadı") || error.includes("içermiyor") ))
                            ? "Soru Tanımlanamadı" 
                            : "İşlem Hatası"}
                    </AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
          </div>
        );
        case 'results':
            if (!aiResults) { 
                return (
                  <div className="space-y-4 flex flex-col items-center">
                    <p>Sonuçlar yüklenirken bir sorun oluştu.</p>
                    <Button onClick={handleRetakeOrUploadAnother} variant="outline">Yeni Soru Tara</Button>
                  </div>
                );
            }
           
            return (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-primary text-center">Yapay Zeka Çözümü</h2>
                    {imageSrc && ( 
                        <Card className="overflow-hidden shadow-lg">
                            <CardHeader>
                                <CardTitle>Taranan Soru Görüntüsü</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Image src={imageSrc} alt="Taranan Soru" width={400} height={560} className="object-contain w-full h-auto rounded-md border" data-ai-hint="question scan" />
                            </CardContent>
                        </Card>
                    )}
                    {aiResults.questionText && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><HelpCircleIcon className="h-5 w-5 text-primary"/> Soru Metni (Yapay Zeka Tarafından Okunan)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">{aiResults.questionText}</p>
                            </CardContent>
                        </Card>
                    )}
                    <Card className="bg-green-50 dark:bg-green-900/30 border-green-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400"/> Çözüm</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-green-700 dark:text-green-300 whitespace-pre-wrap">{aiResults.solution}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-yellow-500"/> Açıklama</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground/90 whitespace-pre-wrap">{aiResults.explanation}</p>
                        </CardContent>
                    </Card>

                    {aiResults.isBiologyQuestion && (
                      <Card className="mt-6 border-blue-500 dark:border-blue-400">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <MessageSquare className="h-5 w-5" />
                            Cevap Hakkında Geri Bildirim
                          </CardTitle>
                          <CardDescription>Yapay zekanın cevabı hatalı veya eksik mi? Düşüncelerinizi bizimle paylaşın.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {!showFeedbackForm ? (
                            <Button variant="outline" onClick={handleToggleFeedbackForm} className="w-full sm:w-auto">
                              Cevap Yanlış mı? Düzeltme Önerin
                            </Button>
                          ) : (
                            <div className="space-y-3">
                              <Textarea
                                placeholder="Yapay zekanın cevabıyla ilgili düşünceleriniz, doğru cevap veya eklemek istedikleriniz..."
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                rows={4}
                                className="text-sm"
                              />
                              <div className="flex flex-col sm:flex-row justify-end gap-2">
                                <Button variant="ghost" onClick={handleToggleFeedbackForm} size="sm">İptal</Button>
                                <Button onClick={handleFeedbackSubmit} disabled={!feedbackText.trim()} size="sm">Geri Bildirimi Gönder</Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <Button onClick={handleRetakeOrUploadAnother} variant="default" className="w-full text-lg py-3">
                        <RefreshCcw className="mr-2 h-5 w-5" /> Yeni Soru Tara
                    </Button>
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
