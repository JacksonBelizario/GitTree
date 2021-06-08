import { useEffect, useRef } from "react";

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    if (delay === null || delay === 0) {
      return
    }

    const id = setInterval(async () => await savedCallback.current(), delay)

    return () => clearInterval(id)
  }, [delay])
}

function useIntervalAsync(callback: () => Promise<void>, delay: number | null) {
  const savedCallback = useRef(callback)

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    if (delay === null || delay === 0) {
      return
    }

    const intervalAsync = async () => {
      if (!id) {
        return;
      }
      clearTimeout(id);
      await savedCallback.current();
      id = setTimeout(() => intervalAsync(), delay)
    }

    let id = setTimeout(() => intervalAsync(), delay);

    return () => clearTimeout(id)
  }, [delay])
}

function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the timeout.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    if (delay === null) {
      return
    }

    const id = setTimeout(() => savedCallback.current(), delay)

    return () => clearTimeout(id)
  }, [delay])
}

export { useInterval, useIntervalAsync, useTimeout };
