"use client";

import { useState, useCallback } from "react";
import html2canvas from "html2canvas";

interface ExportButtonProps {
  targetId: string;
  filename?: string;
}

export function ExportButton({
  targetId,
  filename = "tinh-xang.png",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setIsExporting(false);
    }
  }, [targetId, filename]);

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="rounded-full border-[0.5px] border-[#1a1a18] bg-[#1a1a18] px-4 py-2 text-[13px] font-medium text-[#F0EDE6] transition-colors hover:bg-[#333] disabled:bg-[#888780]"
    >
      {isExporting ? "Đang tải..." : "Lưu ảnh"}
    </button>
  );
}
