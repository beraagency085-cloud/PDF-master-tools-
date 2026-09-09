import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

export interface ToolProcessingState {
  isProcessing: boolean;
  progress: number; // 0 to 100
  stage: string;
  detail: string;
  fileName?: string;
  elapsedSeconds: number;
}

export interface ToolProcessingContextValue extends ToolProcessingState {
  setIsProcessing: (processing: boolean) => void;
  setProgress: (progress: number) => void;
  setStage: (stage: string) => void;
  setDetail: (detail: string) => void;
  startProcessing: (options?: { stage?: string; detail?: string; fileName?: string }) => void;
  updateProgress: (progress: number, stage?: string, detail?: string) => void;
  finishProcessing: (onComplete?: () => void) => void;
  resetProcessing: () => void;
  simulateProcessing: (durationMs?: number, customStage?: string) => void;
}

const DEFAULT_STAGE = 'Initializing WebAssembly engine...';
const DEFAULT_DETAIL = 'Executing in-browser client sandbox • Zero server upload';

const ToolProcessingContext = createContext<ToolProcessingContextValue | undefined>(undefined);

export const ToolProcessingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<string>(DEFAULT_STAGE);
  const [detail, setDetail] = useState<string>(DEFAULT_DETAIL);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoProgressRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoProgressRef.current) clearInterval(autoProgressRef.current);
    };
  }, []);

  const resetProcessing = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoProgressRef.current) clearInterval(autoProgressRef.current);
    timerRef.current = null;
    autoProgressRef.current = null;
    setIsProcessing(false);
    setProgress(0);
    setStage(DEFAULT_STAGE);
    setDetail(DEFAULT_DETAIL);
    setFileName(undefined);
    setElapsedSeconds(0);
  }, []);

  const startProcessing = useCallback(
    (options?: { stage?: string; detail?: string; fileName?: string }) => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoProgressRef.current) clearInterval(autoProgressRef.current);

      setIsProcessing(true);
      setProgress(12);
      setStage(options?.stage || 'Initializing WebAssembly modules...');
      setDetail(options?.detail || DEFAULT_DETAIL);
      setFileName(options?.fileName);
      setElapsedSeconds(0);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Smooth realistic progress auto-stepper for Wasm operations that don't have fine-grained callbacks
      let currentProgress = 12;
      autoProgressRef.current = setInterval(() => {
        currentProgress += Math.max(1, (92 - currentProgress) * 0.15);
        setProgress((prev) => {
          // If manually updated higher, respect it
          const next = Math.max(prev, Math.min(94, Math.round(currentProgress)));
          if (next >= 40 && next < 70) {
            setStage('Compiling & processing document buffers in RAM...');
          } else if (next >= 70 && next < 90) {
            setStage('Executing WebAssembly transformation algorithms...');
          } else if (next >= 90) {
            setStage('Packing & verifying output byte stream...');
          }
          return next;
        });
      }, 250);
    },
    []
  );

  const updateProgress = useCallback((newProgress: number, newStage?: string, newDetail?: string) => {
    setProgress(Math.min(100, Math.max(0, Math.round(newProgress))));
    if (newStage) setStage(newStage);
    if (newDetail) setDetail(newDetail);
  }, []);

  const finishProcessing = useCallback(
    (onComplete?: () => void) => {
      if (autoProgressRef.current) clearInterval(autoProgressRef.current);
      autoProgressRef.current = null;
      setProgress(100);
      setStage('Process completed successfully!');
      setDetail('Output ready in client memory');

      setTimeout(() => {
        setIsProcessing(false);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        if (onComplete) onComplete();
      }, 450);
    },
    []
  );

  const simulateProcessing = useCallback(
    (durationMs: number = 3200, customStage?: string) => {
      startProcessing({
        stage: customStage || 'Simulating WebAssembly Wasm pipeline...',
        detail: 'Benchmarking client-side memory execution speeds',
      });

      const intervalStep = durationMs / 100;
      let p = 10;
      const simTimer = setInterval(() => {
        p += 3;
        if (p >= 100) {
          clearInterval(simTimer);
          finishProcessing();
        } else {
          updateProgress(
            p,
            p < 40
              ? 'Wasm JIT runtime decoding binary stream...'
              : p < 75
              ? 'Parallel Web Worker chunk processing...'
              : 'Generating final artifact in browser RAM...'
          );
        }
      }, intervalStep);
    },
    [startProcessing, finishProcessing, updateProgress]
  );

  return (
    <ToolProcessingContext.Provider
      value={{
        isProcessing,
        progress,
        stage,
        detail,
        fileName,
        elapsedSeconds,
        setIsProcessing,
        setProgress,
        setStage,
        setDetail,
        startProcessing,
        updateProgress,
        finishProcessing,
        resetProcessing,
        simulateProcessing,
      }}
    >
      {children}
    </ToolProcessingContext.Provider>
  );
};

export const useToolProcessing = (): ToolProcessingContextValue => {
  const context = useContext(ToolProcessingContext);
  if (!context) {
    // Return safe fallback if used outside provider
    return {
      isProcessing: false,
      progress: 0,
      stage: DEFAULT_STAGE,
      detail: DEFAULT_DETAIL,
      elapsedSeconds: 0,
      setIsProcessing: () => {},
      setProgress: () => {},
      setStage: () => {},
      setDetail: () => {},
      startProcessing: () => {},
      updateProgress: () => {},
      finishProcessing: () => {},
      resetProcessing: () => {},
      simulateProcessing: () => {},
    };
  }
  return context;
};
