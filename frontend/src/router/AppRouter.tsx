/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, type ReactElement } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTimerStore } from "@/stores/timerStore";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const TasksPage = lazy(() => import("@/pages/TasksPage"));
const StatsPage = lazy(() => import("@/pages/StatsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const CollectionsPage = lazy(() => import("@/pages/CollectionsPage"));
const FocusPage = lazy(() => import("@/pages/FocusPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const FutureCountdownPage = lazy(() => import("@/pages/FutureCountdownPage"));

function ProtectedRoute({ children }: { children: ReactElement }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function ActiveTimerRouteGuard({ children }: { children: ReactElement }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const activeTodo = useTimerStore((state) => state.todo);
  const timerState = useTimerStore((state) => state.state);
  const needsFocusRoute =
    activeTodo &&
    (timerState === "running" || timerState === "paused" || timerState === "completed" || timerState === "abandoned");
  const focusPath = activeTodo ? `/focus/${activeTodo.id}` : "";
  const timerPath = activeTodo ? `/timer/${activeTodo.id}` : "";
  const isCurrentTimerRoute = location.pathname === focusPath || location.pathname === timerPath;

  if (isAuthenticated && needsFocusRoute && !isCurrentTimerRoute) {
    return <Navigate to={focusPath} replace state={{ lockedByTimer: true }} />;
  }

  return children;
}

export function AppRouter() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--app-bg)]" />}>
      <ActiveTimerRouteGuard>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/focus/:todoId"
            element={
              <ProtectedRoute>
                <FocusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timer/:todoId"
            element={
              <ProtectedRoute>
                <FocusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections"
            element={
              <ProtectedRoute>
                <CollectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <StatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/future"
            element={
              <ProtectedRoute>
                <FutureCountdownPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ActiveTimerRouteGuard>
    </Suspense>
  );
}
