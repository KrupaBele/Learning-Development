import React, { useRef, useEffect, useState } from "react";
import { aiActions, getIconComponent } from "../services/aiService";

interface AIContextMenuProps {
  x: number;
  y: number;
  selectedText: string;
  onClose: () => void;
  onApplyAI: (result: string) => void;
}

const AIContextMenu: React.FC<AIContextMenuProps> = ({
  x,
  y,
  selectedText,
  onClose,
  onApplyAI,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleAIAction = async (actionId: string) => {
    const action = aiActions.find((a) => a.id === actionId);
    if (!action) return;

    setLoading(actionId);
    try {
      const result = await action.action(selectedText);
      onApplyAI(result);
    } catch (error) {
      console.error("AI action failed:", error);
    } finally {
      setLoading(null);
      onClose();
    }
  };

  // Adjust position to ensure menu stays within viewport
  const adjustedX = Math.min(x, window.innerWidth - 280);
  const adjustedY = Math.min(y, window.innerHeight - 300);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-64 overflow-hidden"
      style={{ left: adjustedX, top: adjustedY }}
    >
      <div className="p-3 bg-indigo-600 text-white font-medium">AI Actions</div>
      <div className="max-h-80 overflow-y-auto">
        {aiActions.map((action) => {
          const Icon = getIconComponent(action.icon);
          return (
            <button
              key={action.id}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 transition-colors"
              onClick={() => handleAIAction(action.id)}
              disabled={loading !== null}
            >
              <Icon className="w-4 h-4 text-indigo-600" />
              <div>
                <div className="font-medium">{action.name}</div>
                <div className="text-xs text-gray-500">
                  {action.description}
                </div>
              </div>
              {loading === action.id && (
                <div className="ml-auto">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AIContextMenu;
