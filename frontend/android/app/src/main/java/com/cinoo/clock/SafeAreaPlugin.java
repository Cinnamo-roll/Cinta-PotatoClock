package com.cinoo.clock;

import android.graphics.Insets;
import android.os.Build;
import android.view.WindowInsets;
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
            WindowInsets windowInsets = getActivity().getWindow().getDecorView().getRootWindowInsets();
            if (windowInsets != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    Insets statusBars = windowInsets.getInsets(WindowInsets.Type.statusBars() | WindowInsets.Type.displayCutout());
                    Insets navigationBars = windowInsets.getInsets(WindowInsets.Type.navigationBars());
                    top = statusBars.top;
                    bottom = navigationBars.bottom;
                } else {
                    top = windowInsets.getStableInsetTop();
                    bottom = windowInsets.getStableInsetBottom();
                }
            }
            float density = getContext().getResources().getDisplayMetrics().density;
            JSObject result = new JSObject();
            result.put("top", top / density);
            result.put("bottom", bottom / density);
            call.resolve(result);
        });
    }
}
