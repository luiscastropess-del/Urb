"use client";

import { createContext, useContext, useState, ReactNode } from "react";

const ToastContext = createContext<{ showToast: (msg: string) => void }>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({
    msg: "",
    visible: false,
  });

  const showToast = (msg: string) => {
    setToast({ msg, visible: true });
    // Reset after 3 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`absolute bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-3 rounded-full text-sm font-medium shadow-xl z-[100] transition-all duration-300 pointer-events-none w-max max-w-[90%] text-center ${toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {toast.msg}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
