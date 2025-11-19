/*
 * @Author: Libra
 * @Date: 2025-11-07 16:23:48
 * @LastEditors: Libra
 * @Description:
 */
/// <reference lib="webworker" />

import type {
  CountdownStatus,
  CountdownWorkerCommand,
  CountdownWorkerMessage,
  CountdownWorkerUpdate,
} from "./types";

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

let totalSeconds = 0;
let remainingSeconds = 0;
let status: CountdownStatus = "idle";
let timer: number | null = null;

const clearTimer = () => {
  if (timer !== null) {
    ctx.clearInterval(timer);
    timer = null;
  }
};

const dispatchUpdate = () => {
  const message: CountdownWorkerUpdate = {
    type: "update",
    payload: {
      status,
      total: totalSeconds,
      remaining: remainingSeconds,
      timestamp: Date.now(),
    },
  };

  ctx.postMessage(message satisfies CountdownWorkerMessage);
};

const tick = () => {
  if (remainingSeconds <= 0) {
    status = "finished";
    dispatchUpdate();
    clearTimer();
    return;
  }

  remainingSeconds = Math.max(remainingSeconds - 1, 0);

  if (remainingSeconds === 0) {
    status = "finished";
    dispatchUpdate();
    clearTimer();
  } else {
    dispatchUpdate();
  }
};

const scheduleTick = () => {
  clearTimer();
  if (status !== "running" || remainingSeconds <= 0) {
    return;
  }

  timer = ctx.setInterval(tick, 1000);
};

const startCountdown = (duration: number) => {
  const normalized = Math.max(0, Math.floor(duration));
  totalSeconds = normalized;
  remainingSeconds = normalized;
  status = normalized > 0 ? "running" : "finished";
  dispatchUpdate();
  if (status === "running") {
    scheduleTick();
  }
};

const pauseCountdown = () => {
  if (status !== "running") {
    return;
  }
  clearTimer();
  status = "paused";
  dispatchUpdate();
};

const resumeCountdown = () => {
  if (status !== "paused" || remainingSeconds <= 0) {
    return;
  }
  status = "running";
  dispatchUpdate();
  scheduleTick();
};

const resetCountdown = () => {
  clearTimer();
  remainingSeconds = totalSeconds;
  status = "idle";
  dispatchUpdate();
};

const updateDuration = (duration: number) => {
  const normalized = Math.max(0, Math.floor(duration));
  totalSeconds = normalized;
  if (status === "idle" || status === "finished" || status === "paused") {
    remainingSeconds = normalized;
  }
  if (status === "running" && remainingSeconds > normalized) {
    remainingSeconds = normalized;
  }
  if (normalized === 0) {
    clearTimer();
    status = "idle";
  }
  dispatchUpdate();
};

ctx.addEventListener(
  "message",
  (event: MessageEvent<CountdownWorkerCommand>) => {
    const command = event.data;

    switch (command.type) {
      case "start":
        startCountdown(command.payload.duration);
        break;
      case "pause":
        pauseCountdown();
        break;
      case "resume":
        resumeCountdown();
        break;
      case "reset":
        resetCountdown();
        break;
      case "set-duration":
        updateDuration(command.payload.duration);
        break;
      default:
        break;
    }
  }
);

dispatchUpdate();
