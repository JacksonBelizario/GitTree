import { useEffect, useRef } from "react";

function useInterval(callback: CallableFunction, delay: number) {
  const savedCallback = useRef<CallableFunction>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null && delay !== 0) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export { useInterval };
