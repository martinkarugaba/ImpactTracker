import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#fff",
          color: "#363636",
        },
        success: {
          style: {
            background: "#10B981",
            color: "#fff",
          },
        },
        error: {
          style: {
            background: "#EF4444",
            color: "#fff",
          },
        },
      }}
    />
  );
}
