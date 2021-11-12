import { useRef, useEffect } from "react";

export function useHorizontalScroll() {
  const elRef = useRef(null);

  useEffect(() => {
    const el: any = elRef.current;
    if (el) {
      const onWheel = (e: any) => {

        if (el.scrollLeft == 0 && e.deltaY < 0) {
          return;
        }

        if (el.scrollLeft >= el.offsetWidth * 4 && e.deltaY > 0) {
          return;
        }

        e.preventDefault();
        
        el.scrollTo({
          left: el.scrollLeft + 3 * e.deltaY,
          behavior: "smooth"
        });

      };
      el.addEventListener("wheel", onWheel);
      return () => el.removeEventListener("wheel", onWheel);
    }
  }, []);
  return elRef;
}