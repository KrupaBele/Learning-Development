import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { X, BookOpen, CheckSquare, Square, Search, Send } from "lucide-react";

interface Module {
  _id: string;
  title: string;
  category: string;
  status: string;
}

interface Client {
  _id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  assignedModules: { _id: string; title: string; category: string; status: string }[];
}

interface Props {
  client: Client;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignCoursesModal = ({ client, onClose, onSuccess }: Props) => {
  const token = useSelector((state: any) => state.auth.token);
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const alreadyAssigned = new Set(client.assignedModules.map((m) => m._id));

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/modules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data?.modules ?? res.data?.data ?? res.data;
        const published = (Array.isArray(data) ? data : []).filter(
          (m: Module) => m.status === "published"
        );
        setModules(published);
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoadingModules(false);
      }
    };
    fetchModules();
  }, []);

  const toggleSelect = (id: string) => {
    if (alreadyAssigned.has(id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = modules.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = async () => {
    if (selected.size === 0) {
      toast.error("Please select at least one course");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/onboarding/${client._id}/assign-modules`,
        { moduleIds: Array.from(selected) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Courses assigned and credentials sent to manager!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to assign courses");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen size={18} className="text-blue-500" />
              Assign Courses
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              <span className="font-medium text-gray-700 dark:text-gray-300">{client.companyName}</span>
              {" · "}Contact: {client.contactName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-8 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Info strip */}
        {selected.size > 0 && (
          <div className="mx-6 mt-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-400">
            {selected.size} course{selected.size > 1 ? "s" : ""} selected
          </div>
        )}

        {/* Course list */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
          {loadingModules ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              {search ? "No courses match your search." : "No published courses available."}
            </div>
          ) : (
            filtered.map((m) => {
              const isAssigned = alreadyAssigned.has(m._id);
              const isSelected = selected.has(m._id);
              return (
                <div
                  key={m._id}
                  onClick={() => toggleSelect(m._id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isAssigned
                      ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 cursor-default opacity-70"
                      : isSelected
                      ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750"
                  }`}
                >
                  {/* Checkbox icon */}
                  <div className="flex-shrink-0">
                    {isAssigned ? (
                      <CheckSquare size={18} className="text-green-500" />
                    ) : isSelected ? (
                      <CheckSquare size={18} className="text-blue-600" />
                    ) : (
                      <Square size={18} className="text-gray-300 dark:text-gray-600" />
                    )}
                  </div>

                  {/* Course info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.category}</p>
                  </div>

                  {/* Badge */}
                  {isAssigned && (
                    <span className="flex-shrink-0 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                      Already assigned
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            On confirm, the manager will receive login credentials and assigned course list via email.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting || selected.size === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {submitting ? "Sending..." : "Confirm & Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignCoursesModal;
