import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { PhaseTelemetry } from '../contexts/GameContext';

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Enum for phase states
 */
export enum PhaseState {
  IDLE = 'idle',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}

/**
 * Response data for a phase
 */
export interface PhaseResponse {
  isCorrect: boolean;
  accuracy?: number; // 0 to 1 (0% to 100%)
  hesitationFactor?: number; // 0 to 1 (0% to 100%) - indicates pauses/delays
}

/**
 * Timer state
 */
interface TimerState {
  startTime: number | null;
  pausedTime: number | null;
  totalPausedDuration: number;
}

/**
 * Hook return type
 */
export interface UseGameLogicReturn {
  // State
  currentPhaseId: string | null;
  phaseState: PhaseState;
  reactionTime: number | null; // in milliseconds
  currentScore: number | null; // 0 to 10
  elapsedTime: number; // current elapsed time in milliseconds

  // Phase management
  startPhase: (phaseId: string) => void;
  pausePhase: () => void;
  resumePhase: () => void;
  completePhase: (response: PhaseResponse) => void;
  resetPhase: () => void;

  // Timer utilities
  getFormattedTime: () => string; // MM:SS format
  getRawTimerState: () => TimerState;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Base score multiplier for timing-based scoring
 * Lower reaction times = higher scores
 */
const BASE_SCORE = 10;

/**
 * Reaction time threshold in milliseconds
 * Reactions faster than this are considered ideal
 */
const IDEAL_REACTION_TIME_MS = 500;

/**
 * Maximum reaction time to still earn points
 * Beyond this, score is capped at minimum
 */
const MAX_REACTION_TIME_MS = 5000;

/**
 * Hesitation factor weight
 * How much hesitation impacts the final score (0 to 1)
 */
const HESITATION_WEIGHT = 0.15;

/**
 * Accuracy weight in score calculation (0 to 1)
 */
const ACCURACY_WEIGHT = 0.7;

/**
 * Timing weight in score calculation (0 to 1)
 */
const TIMING_WEIGHT = 0.15;

// ============================================================================
// Custom Hook: useGameLogic
// ============================================================================

/**
 * Custom hook for managing MEEM game phase logic and telemetry
 *
 * Features:
 * - High-precision timer using performance.now()
 * - Automatic reaction time calculation in seconds
 * - Decimal score computation (0-10) based on accuracy
 * - Support for pause/resume functionality
 * - Hesitation detection and tracking
 * - Automatic telemetry buffer updates via GameContext
 * - State management for phase transitions
 *
 * @returns {UseGameLogicReturn} Game logic interface
 *
 * @example
 * ```tsx
 * const {
 *   currentPhaseId,
 *   phaseState,
 *   reactionTime,
 *   currentScore,
 *   elapsedTime,
 *   startPhase,
 *   completePhase,
 *   getFormattedTime,
 * } = useGameLogic();
 *
 * useEffect(() => {
 *   startPhase('phase-1');
 * }, []);
 *
 * const handleSubmitAnswer = (isCorrect: boolean) => {
 *   completePhase({
 *     isCorrect,
 *     accuracy: isCorrect ? 1.0 : 0.0,
 *     hesitationFactor: 0.1,
 *   });
 * };
 * ```
 */
export const useGameLogic = (): UseGameLogicReturn => {
  // ========================================================================
  // Context Integration
  // ========================================================================

  const gameContext = useGameContext();

  // ========================================================================
  // State Management
  // ========================================================================

  const [currentPhaseId, setCurrentPhaseId] = useState<string | null>(null);
  const [phaseState, setPhaseState] = useState<PhaseState>(PhaseState.IDLE);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // ========================================================================
  // Refs for Timer Management
  // ========================================================================

  const timerRef = useRef<TimerState>({
    startTime: null,
    pausedTime: null,
    totalPausedDuration: 0,
  });

  const animationFrameRef = useRef<number | null>(null);

  // ========================================================================
  // Helper Functions
  // ========================================================================

  /**
   * Get current elapsed time in milliseconds
   */
  const getElapsedTime = useCallback((): number => {
    const timer = timerRef.current;

    if (timer.startTime === null) {
      return 0;
    }

    // If currently paused, return time up to pause point
    if (timer.pausedTime !== null) {
      return timer.pausedTime - timer.startTime - timer.totalPausedDuration;
    }

    // Calculate current elapsed time
    const now = performance.now();
    return now - timer.startTime - timer.totalPausedDuration;
  }, []);

  /**
   * Format time to MM:SS format
   */
  const getFormattedTime = useCallback((): string => {
    const milliseconds = getElapsedTime();
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [getElapsedTime]);

  /**
   * Calculate score based on accuracy, reaction time, and hesitation
   *
   * Score components:
   * - Accuracy: 70% weight (primary factor)
   * - Timing: 15% weight (rewarding quick responses)
   * - Hesitation penalty: 15% weight (penalizes hesitation)
   */
  const calculateScore = useCallback(
    (response: PhaseResponse, reactionTimeMs: number): number => {
      // Start with base score
      let score = BASE_SCORE;

      // ====================================================================
      // Accuracy Component (70% of score)
      // ====================================================================

      const accuracy = response.accuracy ?? (response.isCorrect ? 1.0 : 0.0);
      const accuracyScore = accuracy * BASE_SCORE * ACCURACY_WEIGHT;

      // ====================================================================
      // Timing Component (15% of score)
      // ====================================================================

      // Calculate timing score inversely proportional to reaction time
      let timingScore = 0;
      if (reactionTimeMs <= IDEAL_REACTION_TIME_MS) {
        // Perfect timing: full points for quick responses
        timingScore = BASE_SCORE * TIMING_WEIGHT;
      } else if (reactionTimeMs >= MAX_REACTION_TIME_MS) {
        // Slow response: minimum timing points
        timingScore = BASE_SCORE * TIMING_WEIGHT * 0.2;
      } else {
        // Linear interpolation between ideal and max time
        const timeRatio =
          (reactionTimeMs - IDEAL_REACTION_TIME_MS) /
          (MAX_REACTION_TIME_MS - IDEAL_REACTION_TIME_MS);
        timingScore = BASE_SCORE * TIMING_WEIGHT * (1 - timeRatio * 0.8);
      }

      // ====================================================================
      // Hesitation Component (15% penalty)
      // ====================================================================

      const hesitationFactor = response.hesitationFactor ?? 0;
      const hesitationPenalty =
        BASE_SCORE * HESITATION_WEIGHT * hesitationFactor;

      // ====================================================================
      // Final Score Calculation
      // ====================================================================

      score = accuracyScore + timingScore - hesitationPenalty;

      // Ensure score stays within bounds [0, 10]
      score = Math.max(0, Math.min(10, score));

      // Round to 2 decimal places
      return Math.round(score * 100) / 100;
    },
    [],
  );

  /**
   * Create telemetry object for current phase
   */
  const createTelemetry = useCallback(
    (
      phaseId: string,
      reactionTimeMs: number,
      score: number,
    ): PhaseTelemetry => {
      // Calculate hesitation rate based on total pause time
      const hesitationRate =
        timerRef.current.totalPausedDuration > 0
          ? Math.min(
              100,
              (timerRef.current.totalPausedDuration / reactionTimeMs) * 100,
            )
          : 0;

      return {
        phaseId,
        score,
        reactionTime: reactionTimeMs,
        hesitationRate: Math.round(hesitationRate * 100) / 100,
        timestamp: new Date().toISOString(),
        duration: reactionTimeMs,
      };
    },
    [],
  );

  // ========================================================================
  // Animation Frame Loop for Elapsed Time Updates
  // ========================================================================

  useEffect(() => {
    if (phaseState !== PhaseState.ACTIVE) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const updateElapsedTime = () => {
      setElapsedTime(getElapsedTime());
      animationFrameRef.current = requestAnimationFrame(updateElapsedTime);
    };

    animationFrameRef.current = requestAnimationFrame(updateElapsedTime);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [phaseState, getElapsedTime]);

  // ========================================================================
  // Phase Management Functions
  // ========================================================================

  /**
   * Start a new phase with high-precision timer
   */
  const startPhase = useCallback((phaseId: string) => {
    setCurrentPhaseId(phaseId);
    setPhaseState(PhaseState.ACTIVE);
    setReactionTime(null);
    setCurrentScore(null);
    setElapsedTime(0);

    // Reset and start timer
    timerRef.current = {
      startTime: performance.now(),
      pausedTime: null,
      totalPausedDuration: 0,
    };
  }, []);

  /**
   * Pause the current phase
   */
  const pausePhase = useCallback(() => {
    if (phaseState !== PhaseState.ACTIVE) {
      return;
    }

    const timer = timerRef.current;
    if (timer.pausedTime === null) {
      timer.pausedTime = performance.now();
      setPhaseState(PhaseState.PAUSED);
    }
  }, [phaseState]);

  /**
   * Resume the current phase
   */
  const resumePhase = useCallback(() => {
    if (phaseState !== PhaseState.PAUSED) {
      return;
    }

    const timer = timerRef.current;
    if (timer.pausedTime !== null && timer.startTime !== null) {
      const pauseDuration = performance.now() - timer.pausedTime;
      timer.totalPausedDuration += pauseDuration;
      timer.pausedTime = null;
      setPhaseState(PhaseState.ACTIVE);
    }
  }, [phaseState]);

  /**
   * Complete the current phase with response data
   * Calculates score and stores telemetry
   */
  const completePhase = useCallback(
    (response: PhaseResponse) => {
      if (
        currentPhaseId === null ||
        phaseState === PhaseState.IDLE ||
        phaseState === PhaseState.COMPLETED
      ) {
        console.warn('Cannot complete phase: invalid state or no active phase');
        return;
      }

      // Stop the timer
      const timer = timerRef.current;
      if (timer.startTime === null) {
        return;
      }

      // Calculate reaction time in milliseconds (excluding paused time)
      const reactionTimeMs = getElapsedTime();

      // Calculate score (0 to 10, decimal)
      const score = calculateScore(response, reactionTimeMs);

      // Update state
      setReactionTime(reactionTimeMs);
      setCurrentScore(score);
      setPhaseState(PhaseState.COMPLETED);

      // Create telemetry object and save to context
      const telemetry = createTelemetry(currentPhaseId, reactionTimeMs, score);
      gameContext.addPhaseTelemetry(telemetry);

      // Log phase completion
      console.log(`✅ Phase '${currentPhaseId}' completed:`, {
        reactionTime: `${(reactionTimeMs / 1000).toFixed(2)}s`,
        score: score.toFixed(2),
        accuracy: response.accuracy ?? (response.isCorrect ? 1.0 : 0.0),
        hesitationRate: telemetry.hesitationRate.toFixed(2),
      });
    },
    [
      currentPhaseId,
      phaseState,
      getElapsedTime,
      calculateScore,
      createTelemetry,
      gameContext,
    ],
  );

  /**
   * Reset the current phase
   */
  const resetPhase = useCallback(() => {
    setCurrentPhaseId(null);
    setPhaseState(PhaseState.IDLE);
    setReactionTime(null);
    setCurrentScore(null);
    setElapsedTime(0);

    timerRef.current = {
      startTime: null,
      pausedTime: null,
      totalPausedDuration: 0,
    };

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  /**
   * Get raw timer state (for debugging)
   */
  const getRawTimerState = useCallback((): TimerState => {
    return { ...timerRef.current };
  }, []);

  // ========================================================================
  // Cleanup on Unmount
  // ========================================================================

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // ========================================================================
  // Return Hook Interface
  // ========================================================================

  return {
    // State
    currentPhaseId,
    phaseState,
    reactionTime,
    currentScore,
    elapsedTime,

    // Phase management
    startPhase,
    pausePhase,
    resumePhase,
    completePhase,
    resetPhase,

    // Timer utilities
    getFormattedTime,
    getRawTimerState,
  };
};

export default useGameLogic;
