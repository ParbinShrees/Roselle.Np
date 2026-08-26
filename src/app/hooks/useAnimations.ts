import { useEffect, useRef, useState } from "react";

/**
 * useFadeIn — returns a ref to attach to a div.
 * The element fades in + slides up when it mounts.
 */
export function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [delay]);

  return ref;
}

/**
 * useScrollReveal — observes elements with data-reveal and animates them
 * as they scroll into view.
 */
export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    els.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = "opacity 0.55s ease, transform 0.55s ease";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const d = el.getAttribute("data-reveal-delay") || "0";
            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, Number(d));
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.08 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/**
 * usePageTransition — smooth fade when the page changes.
 */
export function usePageTransition(page: string) {
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(page);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => {
      setCurrentPage(page);
      setVisible(true);
    }, 80);
    return () => clearTimeout(t);
  }, [page]);

  return {
    currentPage,
    style: {
      opacity: visible ? 1 : 0,
      transition: "opacity 0.3s ease",
    } as React.CSSProperties,
  };
}
