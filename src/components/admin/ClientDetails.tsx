import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Building2,
  Users,
  Mail,
  Phone,
  FileText,
  BookOpen,
  Search,
  PlusCircle,
  Trash2,
} from "lucide-react";
import AssignCoursesModal from "./AssignCoursesModal";

interface Client {
  _id: string;
  companyName: string;
  numberOfEmployees: number;
  gstNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  assignedModules: { _id: string; title: string; category: string; status: string }[];
  managerUserId?: { _id: string; username: string; email: string };
  createdAt: string;
}

const ClientDetails = () => {
  const navigate = useNavigate();
  const token = useSelector((state: any) => state.auth.token);
  const [clients, setClients] = useState<Client[]>([]);
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/onboarding`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data.data);
      setFiltered(res.data.data);
    } catch {
      toast.error("Failed to fetch client details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      clients.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q) ||
          c.contactEmail.toLowerCase().includes(q)
      )
    );
  }, [search, clients]);

  const handleOpenAssign = (client: Client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  const handleDelete = async (client: Client) => {
    if (!window.confirm(`Are you sure you want to delete ${client.companyName}? This will also delete the manager account and cannot be undone.`)) {
      return;
    }
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/onboarding/${client._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Client deleted successfully");
      fetchClients();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete client");
    }
  };

  const handleAssignSuccess = () => {
    setShowModal(false);
    setSelectedClient(null);
    fetchClients();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Client Details</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {clients.length} onboarded client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/onboard-client")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <PlusCircle size={16} />
          Onboard Client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company or contact..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {search ? "No clients match your search." : "No clients onboarded yet."}
          </p>
          {!search && (
            <button
              onClick={() => navigate("/admin/onboard-client")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Onboard First Client
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <th className="text-left px-5 py-3.5 font-medium text-gray-600 dark:text-gray-400">Company</th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users size={13} /> Employees
                    </span>
                  </th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FileText size={13} /> GST No.
                    </span>
                  </th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-600 dark:text-gray-400">Point of Contact</th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen size={13} /> Courses Assigned
                    </span>
                  </th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-600 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map((client) => (
                  <tr
                    key={client._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    {/* Company */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Building2 size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{client.companyName}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(client.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Employees */}
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {client.numberOfEmployees.toLocaleString()}
                    </td>

                    {/* GST */}
                    <td className="px-5 py-4 font-mono text-xs text-gray-600 dark:text-gray-400 uppercase">
                      {client.gstNumber}
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{client.contactName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <Mail size={11} /> {client.contactEmail}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <Phone size={11} /> {client.contactPhone}
                      </p>
                    </td>

                    {/* Courses */}
                    <td className="px-5 py-4">
                      {client.assignedModules.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">None assigned</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {client.assignedModules.slice(0, 2).map((m) => (
                            <span
                              key={m._id}
                              className="inline-block text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full max-w-[160px] truncate"
                              title={m.title}
                            >
                              {m.title}
                            </span>
                          ))}
                          {client.assignedModules.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{client.assignedModules.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenAssign(client)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          <BookOpen size={13} />
                          Assign Courses
                        </button>
                        <button
                          onClick={() => handleDelete(client)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap"
                          title="Delete client"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showModal && selectedClient && (
        <AssignCoursesModal
          client={selectedClient}
          onClose={() => { setShowModal(false); setSelectedClient(null); }}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
};

export default ClientDetails;
