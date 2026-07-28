import { AthlosEvent } from "./types";

type Listener = (event: AthlosEvent) => void;

class EventBus {
  private listeners: Map<string, Set<Listener>> = new Map();

  on(type: string, listener: Listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(listener);
    return () => this.listeners.get(type)?.delete(listener);
  }

  emit(type: string, payload?: unknown) {
    const event: AthlosEvent = { type: type as any, timestamp: Date.now(), payload };
    this.listeners.get(type)?.forEach((listener) => listener(event));
  }
}

export const eventBus = new EventBus();
