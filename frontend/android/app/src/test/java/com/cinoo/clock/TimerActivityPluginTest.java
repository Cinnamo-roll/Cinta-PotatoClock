/*
 * Copyright 2026 CintaOvO
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

package com.cinoo.clock;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class TimerActivityPluginTest {
    @Test
    public void inactiveStatesDoNotStartTheTimerService() {
        assertTrue(TimerActivityPlugin.isInactiveState("idle"));
        assertTrue(TimerActivityPlugin.isInactiveState("completed"));
        assertTrue(TimerActivityPlugin.isInactiveState("abandoned"));
        assertFalse(TimerActivityPlugin.isInactiveState("running"));
        assertFalse(TimerActivityPlugin.isInactiveState("paused"));
    }
}
