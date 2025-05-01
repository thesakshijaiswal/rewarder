import { useState, useEffect, useRef } from "react";
import { Button } from "..";

const ReportModal = ({ onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    await onSubmit(reason);
    setSubmitting(false);
    onClose();
  };

  const handleBackdropClick = () => {
    if (!submitting) onClose();
  };

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-xl font-semibold text-red-600">
          Report This Content
        </h2>

        <p className="mb-4 text-sm text-gray-600">
          If you believe this content violates our community guidelines, please
          let us know why. Our team will review your report promptly.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Reason for reporting
            </label>
            <textarea
              ref={textareaRef}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you're reporting this content..."
              required
              disabled={submitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Your report is confidential and helps us keep the community safe.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-600 hover:bg-gray-300"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={!reason.trim() || submitting}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
