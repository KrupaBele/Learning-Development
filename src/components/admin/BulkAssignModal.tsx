import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../../api/api";

interface Module {
  _id: string;
  title: string;
  isMandatory?: boolean;
  status?: string;
}

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeIds: string[];
  onSuccess: () => void;
}

const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
  isOpen,
  onClose,
  employeeIds,
  onSuccess,
}) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await api.get<Module[]>("/api/manager/modules");
        setModules(response.data);
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchModules();
      setSelectedModules([]);
    }
  }, [isOpen]);

  const handleCheckboxChange = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

  const handleAssign = async () => {
    if (selectedModules.length === 0 || employeeIds.length === 0) return;
    try {
      setSubmitting(true);
      await api.post("/api/manager/employees/assign-courses", {
        employeeIds,
        courseIds: selectedModules,
      });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error bulk assigning:", error);
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Failed to assign courses");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold dark:text-white">
              Bulk assign courses
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {employeeIds.length} employee
              {employeeIds.length !== 1 ? "s" : ""} selected
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 dark:text-white hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4 dark:text-white">Loading modules...</div>
        ) : (
          <div className="max-h-96 overflow-y-auto flex-1">
            {modules.map((module) => (
              <div
                key={module._id}
                className="flex items-center p-3 dark:hover:bg-slate-800 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  id={`bulk-${module._id}`}
                  checked={selectedModules.includes(module._id)}
                  onChange={() => handleCheckboxChange(module._id)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:bg-white dark:border-gray-500"
                />
                <label
                  htmlFor={`bulk-${module._id}`}
                  className="ml-3 dark:text-white block text-sm font-medium text-gray-700"
                >
                  {module.title}
                  {module.isMandatory ? (
                    <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                      (Mandatory)
                    </span>
                  ) : null}
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 dark:text-white py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={
              selectedModules.length === 0 ||
              employeeIds.length === 0 ||
              submitting
            }
            className={`px-4 py-2 text-sm text-white rounded ${
              selectedModules.length === 0 ||
              employeeIds.length === 0 ||
              submitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting ? "Assigning…" : "Assign to selected employees"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAssignModal;
