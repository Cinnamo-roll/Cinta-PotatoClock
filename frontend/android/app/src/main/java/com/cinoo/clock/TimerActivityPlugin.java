package com.cinoo.clock;

import android.content.Intent;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TimerActivity")
public class TimerActivityPlugin extends Plugin {
    @PluginMethod
    public void sync(PluginCall call) {
        String state = call.getString("state", "idle");
        Intent intent = new Intent(getContext(), TimerForegroundService.class);
        intent.setAction(TimerForegroundService.ACTION_SYNC);
        intent.putExtra("state", state);
        intent.putExtra("timerType", call.getString("timerType", "countdown"));
        intent.putExtra("title", call.getString("title", "专注计时"));
        putLong(call, intent, "todoId");
        putLong(call, intent, "startedAt");
        putLong(call, intent, "endAt");
        putLong(call, intent, "displaySeconds");

        try {
            if ("running".equals(state) || "paused".equals(state)) {
                ContextCompat.startForegroundService(getContext(), intent);
            } else {
                getContext().startService(intent);
            }
            call.resolve();
        } catch (Exception error) {
            call.reject("无法同步系统计时卡片", error);
        }
    }

    private void putLong(PluginCall call, Intent intent, String key) {
        JSObject data = call.getData();
        if (data.has(key) && !data.isNull(key)) {
            intent.putExtra(key, data.optLong(key));
        }
    }
}
