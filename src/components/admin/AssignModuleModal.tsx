import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../../api/api";

interface Module {
  _id: string;
  title: string;
}

interface AssignModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeEmail: string;
  onAssign: (moduleIds: string[]) => void;
}

const AssignModuleModal: React.FC<AssignModuleModalProps> = ({
  isOpen,
  onClose,
  employeeEmail,
  onAssign,
}) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/manager/modules");
        setModules(response.data);
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchModules();
    }
  }, [isOpen]);

  const handleCheckboxChange = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleAssign = () => {
    onAssign(selectedModules);
    setSelectedModules([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Assign Modules to {employeeEmail}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-white hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading modules...</div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {modules.map((module) => (
              <div
                key={module._id}
                className="flex items-center p-3 dark:hover:bg-slate-800 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  id={module._id}
                  checked={selectedModules.includes(module._id)}
                  onChange={() => handleCheckboxChange(module._id)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:bg-white dark:border-gray-500"
                />
                <label
                  htmlFor={module._id}
                  className="ml-3 dark:text-white block text-sm font-medium text-gray-700"
                >
                  {module.title}
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 dark:text-white py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={selectedModules.length === 0}
            className={`px-4 py-2 text-sm text-white rounded ${
              selectedModules.length === 0
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Assign Selected Modules
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignModuleModal;
