import { useRef, useEffect } from "react";
import location from "@/services/location";

export default function useUnsavedChangesAlert(shouldShowAlert = false) {
  const shouldShowAlertRef = useRef();
  shouldShowAlertRef.current = shouldShowAlert;

  useEffect(() => {
    const unloadMessage = "如果离开将会导致变更丢失！";
    const confirmMessage = `${unloadMessage}\n\n确定离开当前网页?`;
    // store original handler (if any)
    const savedOnBeforeUnload = window.onbeforeunload;

    window.onbeforeunload = function onbeforeunload() {
      return shouldShowAlertRef.current ? unloadMessage : undefined;
    };

    const unsubscribe = location.confirmChange((nextLocation, currentLocation) => {
      if (shouldShowAlertRef.current && nextLocation.path !== currentLocation.path) {
        return confirmMessage;
      }
    });

    return () => {
      window.onbeforeunload = savedOnBeforeUnload;
      unsubscribe();
    };
  }, []);
}
