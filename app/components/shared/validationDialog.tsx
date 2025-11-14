import React from "react";

export interface ValidationDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
  title?: string;
  confirmLabel?: string;
  overlayClassName?: string;
}

const ValidationDialog: React.FC<ValidationDialogProps> = ({
  open,
  onClose,
  message,
  title = "Missing Required Information",
  confirmLabel = "Got it",
  overlayClassName,
}) => {
  if (!open) {
    return null;
  }

  const overlayClasses = `fixed inset-0 ${overlayClassName ?? "z-50"} flex items-center justify-center bg-black/50 px-4`;

  return (
    <div className={overlayClasses}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-slate-700">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <span className="text-amber-500">⚠️</span>
              {title}
            </h3>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          {message ??
            "Please select both Arrival Date and Departure Date before searching for hotels."}
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationDialog;
