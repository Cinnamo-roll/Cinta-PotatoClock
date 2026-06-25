import { useEffect } from "react";

const DEFAULT_SELECTOR = ".app-modal-scroll, .app-scroll";
const MODAL_SELECTOR = ".app-modal-scroll";

function maxScrollTop(element: HTMLElement) {
  return Math.max(element.scrollHeight - element.clientHeight, 0);
}

function findScrollable(target: EventTarget | null, selector: string) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(selector);
}

function scrollInsideBoundary(element: HTMLElement, deltaY: number) {
  const maxTop = maxScrollTop(element);
  if (maxTop <= 0) return;
  element.scrollTop = Math.min(Math.max(element.scrollTop - deltaY, 0), maxTop);
}

export function useScrollBoundaryGuard(selector = DEFAULT_SELECTOR) {
  useEffect(() => {
    let activeElement: HTMLElement | null = null;
    let activeModal: HTMLElement | null = null;
    let lastX = 0;
    let lastY = 0;

    const findScrollableInside = (target: EventTarget | null, boundary: HTMLElement) => {
      if (!(target instanceof Element)) return boundary;
      let current: Element | null = target;
      while (current && current !== boundary.parentElement) {
        if (current instanceof HTMLElement && boundary.contains(current)) {
          const style = window.getComputedStyle(current);
          const canScrollY = /(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight + 1;
          if (canScrollY) return current;
        }
        if (current === boundary) break;
        current = current.parentElement;
      }
      return boundary;
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      activeElement = findScrollable(event.target, selector);
      activeModal = findScrollable(event.target, MODAL_SELECTOR);
      if (!activeElement) return;
      lastX = event.touches[0].clientX;
      lastY = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const scrollElement = activeElement ?? findScrollable(event.target, selector);
      if (!scrollElement) return;

      const currentX = event.touches[0].clientX;
      const currentY = event.touches[0].clientY;
      const deltaX = currentX - lastX;
      const deltaY = currentY - lastY;
      lastX = currentX;
      lastY = currentY;

      if (Math.abs(deltaY) < 1 || Math.abs(deltaX) > Math.abs(deltaY)) return;

      if (activeModal) {
        const modalScrollElement = findScrollableInside(event.target, activeModal);
        if (event.cancelable) event.preventDefault();
        event.stopPropagation();
        scrollInsideBoundary(modalScrollElement, deltaY);
        return;
      }

      if (event.cancelable) event.preventDefault();
      event.stopPropagation();
      scrollInsideBoundary(scrollElement, deltaY);
    };

    const handleTouchEnd = () => {
      activeElement = null;
      activeModal = null;
    };

    document.addEventListener("touchstart", handleTouchStart, { capture: true, passive: true });
    document.addEventListener("touchmove", handleTouchMove, { capture: true, passive: false });
    document.addEventListener("touchend", handleTouchEnd, { capture: true, passive: true });
    document.addEventListener("touchcancel", handleTouchEnd, { capture: true, passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart, { capture: true });
      document.removeEventListener("touchmove", handleTouchMove, { capture: true });
      document.removeEventListener("touchend", handleTouchEnd, { capture: true });
      document.removeEventListener("touchcancel", handleTouchEnd, { capture: true });
    };
  }, [selector]);
}
