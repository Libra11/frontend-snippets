export type CountdownStatus = "idle" | "running" | "paused" | "finished";

export type CountdownWorkerCommand =
  | { type: "start"; payload: { duration: number } }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "reset" }
  | { type: "set-duration"; payload: { duration: number } };

export type CountdownWorkerUpdate = {
  type: "update";
  payload: {
    status: CountdownStatus;
    total: number;
    remaining: number;
    timestamp: number;
  };
};

export type CountdownWorkerMessage = CountdownWorkerUpdate;
