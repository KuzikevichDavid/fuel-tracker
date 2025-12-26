import { useEffect, useState } from "react";
import { Dimensions } from "react-native";

const MOBILE_BREAKPOINT = 768;
const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  const [dimensions, setDimensions] = useState({
    window: windowDimensions,
    screen: screenDimensions,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({window, screen}) => {
        setIsMobile(window.width < MOBILE_BREAKPOINT);
        setDimensions({window, screen});
      },
    );
    setIsMobile(dimensions.window.width < MOBILE_BREAKPOINT);
    return () => subscription?.remove();
  }, []);

  // useEffect(() => {
  //   const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  //   const onChange = () => {
  //     setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  //   };
  //   mql.addEventListener("change", onChange);
  //   setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  //   return () => mql.removeEventListener("change", onChange);
  // }, []);

  return !!isMobile;
}
