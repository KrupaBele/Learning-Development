import { useState, useEffect, useRef } from "react";
import { Upload, Plus, Trash2, X } from "lucide-react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AssignModuleModal from "./AssignModuleModal";
import api, { configureApi } from "../../api/api";

interface Module {
  title: string;
  category: string;
  status: string;
  progress: number;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
  employeeCode: string;
  modules: Module[];
}

interface APIResponse {
  success: boolean;
  data: Employee[];
}

interface AddEmployeeResponse {
  message: string;
  employee: Employee;
}

interface BulkUploadResponse {
  message: string;
  totalProcessed: number;
  added: number;
  skipped: number;
  createdEmployees: {
    email: string;
    username: string;
    _id: string;
  }[];
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employeeEmail: string;
}

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  employeeEmail,
}: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96 z-50 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Confirm Delete
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-gray-600">
            Are you sure you want to delete the employee with email{" "}
            <span className="font-medium">{employeeEmail}</span>?
          </p>
          <p className="text-gray-500 text-sm mt-2">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

const UserManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    username: "",
    email: "",
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    employeeId: "",
    employeeEmail: "",
  });
  const [assignModuleModal, setAssignModuleModal] = useState({
    isOpen: false,
    employeeEmail: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get auth token from Redux store
  const token = useSelector((state: any) => state.auth?.token);

  useEffect(() => {
    if (token) {
      configureApi(token);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchEmployees();
    } else {
      setError("Authentication required");
    }
  }, [token]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<APIResponse>(
        "/api/manager/employees/details"
      );
      console.log("Fetched employees data:", response.data.data);

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        setEmployees(response.data.data);
      } else {
        console.error("Invalid response format:", response.data);
        setError("Invalid response format from server");
        setEmployees([]);
      }
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      setError(error.response?.data?.message || "Failed to fetch employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post<AddEmployeeResponse>(
        "/api/manager/employees",
        newEmployee
      );
      setNewEmployee({ username: "", email: "" });

      // Debug logs
      console.log("Add employee response:", response.data);
      console.log("Showing success toast with message:", response.data.message);

      // Show success message
      toast.success(response.data.message);

      fetchEmployees();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to add employee";
      console.log("Showing error toast with message:", errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile) return;

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      setLoading(true);
      const response = await api.post<BulkUploadResponse>(
        "/api/manager/employees/bulk-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Show success message
      toast.success(response.data.message);

      setCsvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      fetchEmployees();
    } catch (error: any) {
      console.error("Error uploading CSV:", error);
      const errorMsg = error.response?.data?.message || "Failed to upload CSV";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignModule = async (email: string) => {
    setAssignModuleModal({
      isOpen: true,
      employeeEmail: email,
    });
  };

  const handleAssignModules = async (moduleIds: string[]) => {
    try {
      await api.post(`/api/manager/assign-modules`, {
        email: assignModuleModal.employeeEmail,
        moduleIds,
      });
      toast.success("Modules assigned successfully");
      fetchEmployees(); // Refresh the employee list
    } catch (error) {
      console.error("Error assigning modules:", error);
      toast.error("Failed to assign modules");
    }
  };

  const handleDeleteEmployee = async (employeeId: string, email: string) => {
    console.log("Attempting to delete employee:", { employeeId, email });

    if (!employeeId) {
      console.error("Employee ID is undefined");
      toast.error("Cannot delete employee: Invalid ID");
      return;
    }

    try {
      setLoading(true);
      console.log("Making delete request for employee ID:", employeeId);
      await api.delete(`/api/manager/employees/${employeeId}`);
      toast.success("Employee deleted successfully");
      setDeleteModal({ isOpen: false, employeeId: "", employeeEmail: "" });
      fetchEmployees();
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to delete employee";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pl-5">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <h1 className="text-2xl dark:ml-0 ml-5 pt-10 font-semibold text-gray-900 dark:text-white">
        Employee Training Management
      </h1>

      {/* Main Container for horizontal layout */}
      <div className="grid grid-cols-1 mt-5 md:grid-cols-2 gap-6">
        {/* Add Employee Form */}
        <div className="bg-white mt-5 p-6 rounded-lg shadow-sm dark:bg-dark-800 dark:border-dark-700">
          <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Employee Name"
                value={newEmployee.username}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, username: e.target.value })
                }
                className="border rounded-md p-2 dark:border-dark-700 dark:bg-dark-700"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newEmployee.email}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
                className="border rounded-md p-2 dark:border-dark-700 dark:bg-dark-700"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus size={20} /> Add Employee
            </button>
          </form>
        </div>

        {/* CSV Upload */}
        <div className="bg-white mt-5 p-6 rounded-lg shadow-sm dark:bg-dark-800 dark:border-dark-700">
          <h2 className="text-xl font-semibold mb-4">Bulk Upload</h2>
          <div className="flex flex-col gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="border rounded-md p-2 dark:border-dark-700 dark:bg-dark-700"
            />
          </div>
          <button
            onClick={handleBulkUpload}
            disabled={!csvFile || loading}
            className="bg-blue-600 mt-4 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
          >
            <Upload size={20} /> Upload CSV
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, employeeId: "", employeeEmail: "" })
        }
        onConfirm={() =>
          handleDeleteEmployee(
            deleteModal.employeeId,
            deleteModal.employeeEmail
          )
        }
        employeeEmail={deleteModal.employeeEmail}
      />

      {/* Assign Module Modal */}
      <AssignModuleModal
        isOpen={assignModuleModal.isOpen}
        onClose={() =>
          setAssignModuleModal({ isOpen: false, employeeEmail: "" })
        }
        employeeEmail={assignModuleModal.employeeEmail}
        onAssign={handleAssignModules}
      />

      {/* Employees Table */}
      <div className="bg-white mt-10 rounded-lg shadow-sm overflow-hidden dark:bg-dark-800">
        {error && (
          <div className="p-4 text-red-600 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}
        {loading ? (
          <div className="p-4 text-center text-gray-600">Loading...</div>
        ) : (
          <>
            <table className="min-w-full dark:bg-dark-800">
              <thead className="bg-gray-50 dark:bg-dark-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modules
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y dark:bg-dark-800 divide-gray-200">
                {Array.isArray(employees) && employees.length > 0 ? (
                  employees
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )
                    .map((employee) => {
                      console.log("Rendering employee:", employee);
                      return (
                        <tr key={employee.employeeCode}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {employee.employeeCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {employee.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {employee.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-2">
                              {Array.isArray(employee.modules) &&
                              employee.modules.length > 0 ? (
                                <>
                                  {/* Completed Modules */}
                                  {employee.modules.some(
                                    (module) => module.status === "completed"
                                  ) && (
                                    <div className="flex flex-col">
                                      <div
                                        className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center justify-between cursor-pointer group"
                                        onClick={(e) => {
                                          const target = e.currentTarget
                                            .nextElementSibling as HTMLElement;
                                          if (target) {
                                            const isExpanded =
                                              target.style.maxHeight !==
                                                "0px" &&
                                              target.style.maxHeight !== "";
                                            if (isExpanded) {
                                              target.style.maxHeight = "0px";
                                              e.currentTarget
                                                .querySelector("svg")
                                                ?.classList.remove(
                                                  "rotate-180"
                                                );
                                            } else {
                                              target.style.maxHeight = `${target.scrollHeight}px`;
                                              e.currentTarget
                                                .querySelector("svg")
                                                ?.classList.add("rotate-180");
                                            }
                                          }
                                        }}
                                      >
                                        <span>Completed</span>
                                        <svg
                                          className="w-4 h-4 transition-transform duration-300"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                          />
                                        </svg>
                                      </div>
                                      <div
                                        className="overflow-hidden transition-all duration-300 ease-in-out"
                                        style={{ maxHeight: "0px" }}
                                      >
                                        <div className="pl-2 mt-1">
                                          {employee.modules
                                            .filter(
                                              (module) =>
                                                module.status === "completed"
                                            )
                                            .map((module, index) => (
                                              <div
                                                key={index}
                                                className="text-xs py-1"
                                              >
                                                {module.title}
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Pending Modules */}
                                  {employee.modules.some(
                                    (module) => module.status === "pending"
                                  ) && (
                                    <div className="flex flex-col">
                                      <div
                                        className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs flex items-center justify-between cursor-pointer group"
                                        onClick={(e) => {
                                          const target = e.currentTarget
                                            .nextElementSibling as HTMLElement;
                                          if (target) {
                                            const isExpanded =
                                              target.style.maxHeight !==
                                                "0px" &&
                                              target.style.maxHeight !== "";
                                            if (isExpanded) {
                                              target.style.maxHeight = "0px";
                                              e.currentTarget
                                                .querySelector("svg")
                                                ?.classList.remove(
                                                  "rotate-180"
                                                );
                                            } else {
                                              target.style.maxHeight = `${target.scrollHeight}px`;
                                              e.currentTarget
                                                .querySelector("svg")
                                                ?.classList.add("rotate-180");
                                            }
                                          }
                                        }}
                                      >
                                        <span>Pending</span>
                                        <svg
                                          className="w-4 h-4 transition-transform duration-300"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                          />
                                        </svg>
                                      </div>
                                      <div
                                        className="overflow-hidden transition-all duration-300 ease-in-out"
                                        style={{ maxHeight: "0px" }}
                                      >
                                        <div className="pl-2 mt-1">
                                          {employee.modules
                                            .filter(
                                              (module) =>
                                                module.status === "pending"
                                            )
                                            .map((module, index) => (
                                              <div
                                                key={index}
                                                className="text-xs py-1"
                                              >
                                                {module.title}
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-500 text-sm">
                                  No modules assigned
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-5">
                              <button
                                onClick={() =>
                                  handleAssignModule(employee.email)
                                }
                                className="text-blue-600 hover:text-blue-900 text-sm"
                              >
                                <svg
                                  version="1.1"
                                  xmlns="http://www.w3.org/2000/svg"
                                  x="0px"
                                  y="0px"
                                  width="20px"
                                  height="40px"
                                  viewBox="0 0 40 40"
                                  enable-background="new 0 0 40 40"
                                >
                                  <g id="Livello_1"></g>
                                  <g id="Livello_2">
                                    <g>
                                      <path
                                        fill="blue"
                                        d="M24.748,26.1c4.015,0,7.281-3.266,7.281-7.279c0-4.017-3.267-7.283-7.281-7.283
                c-4.015,0-7.282,3.267-7.282,7.283C17.466,22.834,20.733,26.1,24.748,26.1z M24.748,12.736c3.353,0,6.081,2.729,6.081,6.084
                c0,3.353-2.728,6.08-6.081,6.08c-3.354,0-6.082-2.728-6.082-6.08C18.667,15.466,21.395,12.736,24.748,12.736z"
                                      />
                                      <path
                                        fill="blue"
                                        d="M38.045,32.992c-0.319-5.684-5.483-6.032-5.568-6.035l-15.492,0.001c-0.052,0.002-5.217,0.351-5.535,6.067
                v4.308c0,0.331,0.269,0.6,0.6,0.6h25.395c0.332,0,0.6-0.269,0.6-0.6L38.045,32.992z M36.846,36.733H12.651l-0.001-3.675
                c0.256-4.595,4.234-4.893,4.368-4.902l15.424-0.001c0.169,0.011,4.146,0.309,4.403,4.87V36.733z"
                                      />
                                      <path
                                        fill="blue"
                                        d="M12.039,16.15c0.071,0.062,0.158,0.092,0.245,0.092c0.104,0,0.208-0.044,0.283-0.129l2.539-2.91
                c0.136-0.155,0.12-0.393-0.036-0.528c-0.157-0.137-0.393-0.12-0.529,0.036l-2.293,2.628l-1.128-0.975
                c-0.156-0.137-0.393-0.119-0.529,0.038c-0.135,0.156-0.118,0.394,0.039,0.528L12.039,16.15z"
                                      />
                                      <path
                                        fill="blue"
                                        d="M20.13,9.8c0,0,0.174-0.25,0.618-0.4c0.343-0.116,0.562-0.151,0.562-0.151V6.33
                c0-0.768-0.568-1.434-1.434-1.434h-2.194v1.18h2.448V9.8z"
                                      />
                                      <path
                                        fill="blue"
                                        d="M8.993,7.793h7.241c0.37,0,0.717-0.26,0.717-0.731V5.35c0-0.652-0.519-1.185-1.17-1.185h-0.278
                C15.181,2.915,13.959,2,12.606,2h0c-1.353,0-2.575,0.915-2.896,2.165H9.446c-0.651,0-1.184,0.533-1.184,1.185v1.712
                C8.262,7.486,8.571,7.793,8.993,7.793z"
                                      />
                                      <path
                                        fill="blue"
                                        d="M15.952,22.558H5.096V6.076h2.448v-1.18H5.351c-0.768,0-1.419,0.665-1.419,1.434v15.988
                c0,0.768,0.651,1.404,1.419,1.404h11.728C17.079,23.723,16.191,23.355,15.952,22.558z"
                                      />
                                    </g>
                                  </g>
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  console.log(
                                    "Delete button clicked for employee:",
                                    employee
                                  );
                                  setDeleteModal({
                                    isOpen: true,
                                    employeeId: employee._id,
                                    employeeEmail: employee.email,
                                  });
                                }}
                                className="text-red-600 hover:text-red-900 inline-flex items-center"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Pagination Controls */}
            {Array.isArray(employees) && employees.length > itemsPerPage && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between items-center">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of{" "}
                    {Math.ceil(employees.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(employees.length / itemsPerPage)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(employees.length / itemsPerPage)
                    }
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
