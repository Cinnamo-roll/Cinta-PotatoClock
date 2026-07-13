/*
 * Copyright 2026 CintaOvO
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

package com.cinoo.clock;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import java.util.Locale;

public class TimerForegroundService extends Service {
    public static final String ACTION_SYNC = "com.cinoo.clock.timer.SYNC";

    private static final String ACTIVE_CHANNEL_ID = "focus_timer_active";
    private static final String PREFS_NAME = "focus_timer_service";
    private static final int NOTIFICATION_ID = 421000;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable completionRunnable = this::completeCountdown;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannels();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        TimerSnapshot snapshot = intent == null ? restoreSnapshot() : TimerSnapshot.fromIntent(intent);
        if (snapshot == null || "idle".equals(snapshot.state) || "abandoned".equals(snapshot.state)) {
            stopTimer(true);
            return START_NOT_STICKY;
        }
        if ("completed".equals(snapshot.state)) {
            stopTimer(true);
            return START_NOT_STICKY;
        }

        saveSnapshot(snapshot);
        handler.removeCallbacks(completionRunnable);
        if ("running".equals(snapshot.state) && "countdown".equals(snapshot.timerType)) {
            if (snapshot.endAt <= System.currentTimeMillis()) {
                completeCountdown();
                return START_NOT_STICKY;
            }
            handler.postDelayed(completionRunnable, snapshot.endAt - System.currentTimeMillis());
        }
        startForeground(NOTIFICATION_ID, buildActiveNotification(snapshot));
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(completionRunnable);
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private Notification buildActiveNotification(TimerSnapshot snapshot) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, ACTIVE_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_icon)
            .setContentTitle(snapshot.title)
            .setSubText("土豆时钟ToDo")
            .setContentIntent(appPendingIntent())
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOnlyAlertOnce(true)
            .setOngoing(true)
            .setSilent(true)
            .setColor(0xFFF0A43C)
            .setColorized(false)
            .setShowWhen(true)
            .setPriority(NotificationCompat.PRIORITY_LOW);

        if ("paused".equals(snapshot.state)) {
            builder
                .setContentText("已暂停 · " + formatDuration(snapshot.displaySeconds))
                .setUsesChronometer(false);
        } else if ("countdown".equals(snapshot.timerType)) {
            builder
                .setContentText("倒计时进行中")
                .setWhen(snapshot.endAt)
                .setUsesChronometer(true)
                .setChronometerCountDown(true);
        } else if ("countup".equals(snapshot.timerType)) {
            builder
                .setContentText("正计时进行中")
                .setWhen(snapshot.startedAt > 0 ? snapshot.startedAt : System.currentTimeMillis())
                .setUsesChronometer(true);
        } else {
            builder.setContentText("专注进行中").setUsesChronometer(false);
        }
        return builder.build();
    }

    private PendingIntent appPendingIntent() {
        Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (launchIntent == null) launchIntent = new Intent(this, MainActivity.class);
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private void completeCountdown() {
        stopTimer(true);
    }

    private void stopTimer(boolean removeNotification) {
        handler.removeCallbacks(completionRunnable);
        clearSnapshot();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(removeNotification ? STOP_FOREGROUND_REMOVE : STOP_FOREGROUND_DETACH);
        } else {
            stopForeground(removeNotification);
        }
        if (removeNotification) {
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            manager.cancel(NOTIFICATION_ID);
        }
        stopSelf();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        NotificationChannel active = new NotificationChannel(
            ACTIVE_CHANNEL_ID,
            "专注计时",
            NotificationManager.IMPORTANCE_LOW
        );
        active.setDescription("在通知栏和锁屏上持续显示当前计时");
        active.setSound(null, null);
        active.enableVibration(false);
        manager.createNotificationChannel(active);

    }

    private void saveSnapshot(TimerSnapshot snapshot) {
        getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
            .edit()
            .putBoolean("active", true)
            .putString("state", snapshot.state)
            .putString("timerType", snapshot.timerType)
            .putString("title", snapshot.title)
            .putLong("todoId", snapshot.todoId)
            .putLong("startedAt", snapshot.startedAt)
            .putLong("endAt", snapshot.endAt)
            .putLong("displaySeconds", snapshot.displaySeconds)
            .apply();
    }

    private TimerSnapshot restoreSnapshot() {
        SharedPreferences preferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        if (!preferences.getBoolean("active", false)) return null;
        return new TimerSnapshot(
            preferences.getString("state", "idle"),
            preferences.getString("timerType", "countdown"),
            preferences.getString("title", "专注计时"),
            preferences.getLong("todoId", 0),
            preferences.getLong("startedAt", 0),
            preferences.getLong("endAt", 0),
            preferences.getLong("displaySeconds", 0)
        );
    }

    private void clearSnapshot() {
        getSharedPreferences(PREFS_NAME, MODE_PRIVATE).edit().clear().apply();
    }

    private static String formatDuration(long seconds) {
        long safeSeconds = Math.max(0, seconds);
        long hours = safeSeconds / 3600;
        long minutes = (safeSeconds % 3600) / 60;
        long remainingSeconds = safeSeconds % 60;
        if (hours > 0) {
            return String.format(Locale.getDefault(), "%d:%02d:%02d", hours, minutes, remainingSeconds);
        }
        return String.format(Locale.getDefault(), "%02d:%02d", minutes, remainingSeconds);
    }

    private static final class TimerSnapshot {
        final String state;
        final String timerType;
        final String title;
        final long todoId;
        final long startedAt;
        final long endAt;
        final long displaySeconds;

        TimerSnapshot(String state, String timerType, String title, long todoId, long startedAt, long endAt, long displaySeconds) {
            this.state = state;
            this.timerType = timerType;
            this.title = title;
            this.todoId = todoId;
            this.startedAt = startedAt;
            this.endAt = endAt;
            this.displaySeconds = displaySeconds;
        }

        static TimerSnapshot fromIntent(Intent intent) {
            return new TimerSnapshot(
                intent.getStringExtra("state") == null ? "idle" : intent.getStringExtra("state"),
                intent.getStringExtra("timerType") == null ? "countdown" : intent.getStringExtra("timerType"),
                intent.getStringExtra("title") == null ? "专注计时" : intent.getStringExtra("title"),
                intent.getLongExtra("todoId", 0),
                intent.getLongExtra("startedAt", 0),
                intent.getLongExtra("endAt", 0),
                intent.getLongExtra("displaySeconds", 0)
            );
        }
    }
}
