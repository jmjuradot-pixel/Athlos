"use client";

import { useEffect } from "react";
import { configureAI } from "@/services/ai/provider";
import { MockAIService } from "@/services/ai/implementation";

export function AIInit() {
  useEffect(() => {
    configureAI(new MockAIService());
  }, []);
  return null;
}
