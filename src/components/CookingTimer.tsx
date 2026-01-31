'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Bell, Volume2, VolumeX } from 'lucide-react';

interface CookingTimerProps {
  initialMinutes?: number;
  label?: string;
  onComplete?: () => void;
}

export function CookingTimer({ initialMinutes = 0, label, onComplete }: CookingTimerProps) {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context on user interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Play a single beep with given frequency
  const playBeep = useCallback((frequency: number, duration: number) => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    // Smooth envelope to avoid clicks
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [getAudioContext]);

  // Play alarm pattern: 3 quick alternating beeps, pause, repeat
  const playAlarmPattern = useCallback(() => {
    const highFreq = 880; // A5
    const lowFreq = 698;  // F5
    const beepDuration = 0.15;

    // Play 3 quick beeps
    setTimeout(() => playBeep(highFreq, beepDuration), 0);
    setTimeout(() => playBeep(lowFreq, beepDuration), 200);
    setTimeout(() => playBeep(highFreq, beepDuration), 400);
  }, [playBeep]);

  const playAlarm = useCallback(() => {
    if (!soundEnabled) return;

    // Play immediately
    playAlarmPattern();

    // Repeat every 1.5 seconds
    alarmIntervalRef.current = setInterval(() => {
      playAlarmPattern();
    }, 1500);
  }, [soundEnabled, playAlarmPattern]);

  const stopAlarm = useCallback(() => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlarm();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAlarm]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsRunning(false);
            setIsComplete(true);
            playAlarm();
            onComplete?.();
          } else {
            setMinutes(m => m - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(s => s - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, minutes, seconds, playAlarm, onComplete]);

  const handleStart = () => {
    if (minutes === 0 && seconds === 0) return;
    setIsRunning(true);
    setIsComplete(false);
    stopAlarm();
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsComplete(false);
    setMinutes(initialMinutes);
    setSeconds(0);
    stopAlarm();
  };

  const handleAcknowledge = () => {
    setIsComplete(false);
    stopAlarm();
  };

  const adjustTime = (delta: number) => {
    if (isRunning) return;
    const totalSeconds = minutes * 60 + seconds + delta;
    if (totalSeconds >= 0 && totalSeconds <= 5999) {
      setMinutes(Math.floor(totalSeconds / 60));
      setSeconds(totalSeconds % 60);
    }
  };

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`${isComplete ? 'ring-2 ring-red-500 animate-pulse' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {label || 'Timer'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="w-3 h-3" />
            ) : (
              <VolumeX className="w-3 h-3" />
            )}
          </Button>
        </div>

        {/* Time Display */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => adjustTime(-60)}
              disabled={isRunning}
            >
              -
            </Button>
            <span className={`text-4xl font-mono font-bold ${isComplete ? 'text-red-500' : ''}`}>
              {formatTime(minutes, seconds)}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => adjustTime(60)}
              disabled={isRunning}
            >
              +
            </Button>
          </div>
        </div>

        {/* Controls */}
        {isComplete ? (
          <Button
            className="w-full bg-red-500 hover:bg-red-600"
            onClick={handleAcknowledge}
          >
            <Bell className="w-4 h-4 mr-2" />
            Time's Up! Tap to Stop
          </Button>
        ) : (
          <div className="flex gap-2">
            {isRunning ? (
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePause}
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                onClick={handleStart}
                disabled={minutes === 0 && seconds === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Quick presets */}
        {!isRunning && !isComplete && (
          <div className="flex gap-1 mt-2 justify-center">
            {[1, 5, 10, 15, 30].map(m => (
              <Button
                key={m}
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => {
                  setMinutes(m);
                  setSeconds(0);
                }}
              >
                {m}m
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Extract timer from instruction step
export function extractTimerFromStep(step: string): number | null {
  // Match patterns like "5 minutes", "10-15 minutes", "for 30 min", etc.
  const patterns = [
    /(\d+)\s*(?:to|-)\s*(\d+)\s*min/i,
    /(\d+)\s*min/i,
    /(\d+)\s*hour/i,
  ];

  for (const pattern of patterns) {
    const match = step.match(pattern);
    if (match) {
      if (match[2]) {
        // Range - take the higher value
        return parseInt(match[2]);
      }
      const value = parseInt(match[1]);
      // Convert hours to minutes
      if (pattern.source.includes('hour')) {
        return value * 60;
      }
      return value;
    }
  }

  return null;
}
