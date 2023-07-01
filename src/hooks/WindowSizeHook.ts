import { useEffect, useState } from "react";

export interface Size {
    width: number | undefined;
    height: number | undefined;
}

export default function useWindowSize(): Size {
    const [windowSize, setWindowSize] = useState<Size>({
        width: undefined,
        height: undefined,
    });
  
    useEffect(() => {
        function handleResize() {
            setWindowSize(current => {
                if (current.width == window.innerWidth && current.height == window.innerHeight) {
                    return current;
                }
                return {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            });
        }
        
        let active = true;
        function loop() {
            if (!active) return;
            handleResize();
            setTimeout(loop, 100);
        }
        loop();
    
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => {
            active = false;
            window.removeEventListener("resize", handleResize);
        }
    }, []);
  
    return windowSize;
  }