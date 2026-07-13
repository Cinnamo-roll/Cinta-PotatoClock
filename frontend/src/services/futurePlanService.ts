/*
 * Copyright 2026 CintaOvO
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import type { FuturePlan, FuturePlanInput } from "@/types/futurePlan";

const STORAGE_KEY = "potato-clock-future-plans";

function readPlans(): FuturePlan[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FuturePlan[];
  } catch {
    return [];
  }
}

function writePlans(plans: FuturePlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export const futurePlanService = {
  list() {
    return readPlans().sort((a, b) => a.targetDate.localeCompare(b.targetDate));
  },
  create(input: FuturePlanInput) {
    const now = new Date().toISOString();
    const plan: FuturePlan = {
      id: crypto.randomUUID(),
      title: input.title,
      note: input.note,
      targetDate: input.targetDate,
      createdAt: now,
      updatedAt: now
    };
    writePlans([plan, ...readPlans()]);
    return plan;
  },
  remove(id: string) {
    writePlans(readPlans().filter((plan) => plan.id !== id));
  }
};
