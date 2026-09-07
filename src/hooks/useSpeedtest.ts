import { useState, useRef } from 'react';
import { SpeedtestResult } from '../types/models';

export const useSpeedtest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState<'IDLE' | 'PING' | 'DOWNLOAD' | 'UPLOAD' | 'COMPLETE'>('IDLE');
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [ping, setPing] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [result, setResult] = useState<SpeedtestResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSpeedtest = () => {
    setIsRunning(true);
    setStage('PING');
    setCurrentSpeed(0);
    setPing(0);
    setJitter(0);
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setResult(null);

    // 1. PING & JITTER PHASE (1.5s)
    let p = Math.floor(Math.random() * 8 + 8); // 8-16ms
    let j = Math.floor(Math.random() * 3 + 1); // 1-4ms
    setPing(p);
    setJitter(j);

    setTimeout(() => {
      // 2. DOWNLOAD PHASE (3.5s)
      setStage('DOWNLOAD');
      let progress = 0;
      const targetDl = Math.floor(Math.random() * 30 + 65); // 65-95 Mbps

      const dlInterval = setInterval(() => {
        progress += 1;
        const current = Math.min(
          targetDl,
          Math.floor((targetDl * progress) / 15) + Math.floor(Math.random() * 6 - 3)
        );
        setCurrentSpeed(Math.max(current, 5));

        if (progress >= 15) {
          clearInterval(dlInterval);
          setDownloadSpeed(targetDl);

          // 3. UPLOAD PHASE (3s)
          setStage('UPLOAD');
          let upProgress = 0;
          const targetUl = Math.floor(targetDl * 0.45 + Math.random() * 10); // ~40 Mbps

          const ulInterval = setInterval(() => {
            upProgress += 1;
            const currentUl = Math.min(
              targetUl,
              Math.floor((targetUl * upProgress) / 12) + Math.floor(Math.random() * 4 - 2)
            );
            setCurrentSpeed(Math.max(currentUl, 3));

            if (upProgress >= 12) {
              clearInterval(ulInterval);
              setUploadSpeed(targetUl);
              setStage('COMPLETE');
              setIsRunning(false);

              const finalResult: SpeedtestResult = {
                downloadMbps: targetDl,
                uploadMbps: targetUl,
                pingMs: p,
                jitterMs: j,
                packetLossPercent: 0,
                serverLocation: 'Nairobi Central Core Gateway (Equinix IXP)',
                ispGateway: 'STARGAZE-CORE-01',
                timestamp: new Date().toISOString(),
                rating: targetDl > 50 ? 'EXCELLENT' : targetDl > 25 ? 'GOOD' : 'POOR',
              };
              setResult(finalResult);
            }
          }, 200);
        }
      }, 200);
    }, 1500);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setStage('IDLE');
    setCurrentSpeed(0);
    setResult(null);
  };

  return {
    isRunning,
    stage,
    currentSpeed,
    ping,
    jitter,
    downloadSpeed,
    uploadSpeed,
    result,
    startSpeedtest,
    reset,
  };
};

export default useSpeedtest;
