/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

package com.cinoo.clock;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SafeArea")
public class SafeAreaPlugin extends Plugin {
    @PluginMethod
    public void getInsets(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            int top = 0;
            int bottom = 0;
            WindowInsetsCompat windowInsets = ViewCompat.getRootWindowInsets(getActivity().getWindow().getDecorView());
            if (windowInsets != null) {
                Insets statusBars = windowInsets.getInsets(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout());
                Insets navigationBars = windowInsets.getInsets(WindowInsetsCompat.Type.navigationBars());
                top = statusBars.top;
                bottom = navigationBars.bottom;
            }
            float density = getContext().getResources().getDisplayMetrics().density;
            JSObject result = new JSObject();
            result.put("top", top / density);
            result.put("bottom", bottom / density);
            call.resolve(result);
        });
    }
}
