import { useState, useEffect } from "react";
import { Users, CheckCircle, Clock, Search, ChevronDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useSelector } from "react-redux";
import axios from "axios";

interface EmployeeType {
  name: string;
  email: string;
  modules: ModuleType[];
}
interface ModuleType {
  title: string;
  category: string;
  status: string;
  progress: string;
}

const departments = [
  "All Departments",
  "Engineering",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
];
const trainingTypes = [
  "All Types",
  "Technical Skills",
  "Soft Skills",
  "Compliance",
  "Leadership",
];

const MetricCard = ({
  icon: Icon,
  title,
  value,
  trend,
}: {
  icon: any;
  title: string;
  value: string;
  trend?: string;
}) => (
  <div className="bg-white dark:bg-dark-800 dark:border-dark-700 p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div className="p-2 dark:bg-blue-900/30 bg-blue-50 rounded-lg">
        <Icon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
      </div>
      {trend && (
        <span
          className={`text-sm ${
            trend.startsWith("+") ? "text-green-500" : "text-red-500"
          }`}
        >
          {trend}
        </span>
      )}
    </div>
    <h3 className="mt-4 text-gray-600 text-sm dark:text-gray-400 font-medium">
      {title}
    </h3>
    <p className="mt-2 text-2xl dark:text-white font-semibold text-gray-900">
      {value}
    </p>
  </div>
);

const HRDashboard = () => {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [trainingCount, setTrainingCount] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [pending, setPending] = useState(0);
  const [pieData, setPieData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [trainingEngagementData, setTrainingEngagementData] = useState([]);

  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [creditUsed, setCreditUsed] = useState(0);
  const [remainingCredit, setRemainingCredit] = useState(0);

  const token = useSelector((state: any) => state.auth.token);
  const user = useSelector((state: any) => state.auth.user);

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeType | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(
          "https://gaussconnect.com/api/manager/employees/progress",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.status === 401)
          throw new Error("Unauthorized: Invalid Token");

        const data = await response.json();

        if (Array.isArray(data)) {
          setTotalEmployees(data.length);
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    const fetchTrainingData = async () => {
      try {
        const response = await fetch(
          "https://gaussconnect.com/api/manager/training-programs",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.status === 401)
          throw new Error("Unauthorized: Invalid Token");

        const data = await response.json();
        setTrainingCount(data.totalCount);
      } catch (error) {
        console.error("Error fetching training data:", error);
      }
    };

    const fetchModuleStatus = async () => {
      try {
        const response = await fetch(
          "https://gaussconnect.com/api/manager/modules/total-status",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.status === 401)
          throw new Error("Unauthorized: Invalid Token");

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          const statusMap = new Map<string, number>();

          // Loop through data to populate the map
          data.data.forEach((item: { name: string; value: number }) => {
            statusMap.set(item.name, item.value);
          });

          setCompleted(statusMap.get("Completed") ?? 0);
          setPending(statusMap.get("Pending") ?? 0);
          // setOverdue(statusMap.get("Overdue") ?? 0);
          setPieData([
            {
              name: "Completed",
              value: statusMap.get("Completed") ?? 0,
              color: "#10B981",
            },
            {
              name: "Pending",
              value: statusMap.get("Pending") ?? 0,
              color: "#3B82F6",
            },
          ]);
        } else {
          console.error("Invalid response structure", data);
        }
      } catch (error) {
        console.error("Error fetching module status:", error);
      }
    };

    const fetchCreditStatus = async () => {
      try {
        const response = await axios.get(
          `https://gaussconnect.com/api/manager-credit/credit-status/${user?._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setCreditUsed(response.data.data.usedCredits);
        setRemainingCredit(response.data.data.availableCredits);
      } catch (error) {
        console.error("Error fetching credit status:", error);
      }
    };

    fetchEmployeeData();
    fetchTrainingData();
    fetchModuleStatus();
    fetchCreditStatus();
  }, [user]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(
          "https://gaussconnect.com/api/manager/employees/details",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          // Don't flatten the data, keep the original structure
          setEmployeeData(data.data);
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };
    fetchEmployeeData();
  }, []);

  const fetchTrainingEngagement = async () => {
    try {
      const response = await fetch(
        "https://gaussconnect.com/api/manager/modules/categories/status",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 401)
        throw new Error("Unauthorized: Invalid Token");

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setTrainingEngagementData(data.data);
      } else {
        console.error("Invalid response structure", data);
      }
    } catch (error) {
      console.error("Error fetching training engagement data:", error);
    }
  };

  useEffect(() => {
    fetchTrainingEngagement();
  }, []);

  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedType, setSelectedType] = useState("All Types");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="pl-5">
      {/* Header with Filters */}
      <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-50 dark:border-dark-700">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Hi, {user?.username || "Guest User"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Track the learning progress of your employees and manage training!
        </p>
      </div>

      <div className="flex pt-10 flex-wrap gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search employees..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-dark-700 dark:bg-dark-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Department Filter */}
        <div className="relative">
          <select
            className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 dark:border-dark-700 focus:border-transparent  dark:bg-dark-900"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>

        {/* Training Type Filter */}
        <div className="relative">
          <select
            className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 dark:border-dark-700  dark:bg-dark-900 focus:border-transparent"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {trainingTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid pt-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Users}
          title="Total Employees"
          value={totalEmployees.toString()}
        />
        {/* <MetricCard
          icon={GraduationCap}
          title="Active Trainings"
          value="48"
          trend="+5 this week"
        /> */}
        <MetricCard
          icon={Users}
          title="Total Training Programs"
          value={trainingCount.toString()}
        />
        <MetricCard
          icon={CheckCircle}
          title="Used Credits"
          value={(creditUsed ?? 0).toString()}
        />
        <MetricCard
          icon={Clock}
          title="Pending Credits"
          value={(remainingCredit ?? 0).toString()}
        />
        {/* <MetricCard
          icon={AlertCircle}
          title="Overdue Trainings"
          value={overdue.toString()}
        /> */}
      </div>

      {/* Charts Section */}
      <div className="grid pt-10 grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Engagement Chart */}
        <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Training Engagement
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainingEngagementData}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  dy={10}
                  stroke="#94a3b8"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  fontSize={12}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(30 41 59)",
                    border: "none",
                    borderRadius: "0.5rem",
                    padding: "12px",
                  }}
                  labelStyle={{ color: "#fff", marginBottom: "4px" }}
                  itemStyle={{ color: "#fff", padding: "2px 0" }}
                />
                <Bar
                  dataKey="completed"
                  stackId="a"
                  fill="#10B981"
                  stroke="none"
                  barSize={20} // Adjust the width of the bars
                  radius={[10, 10, 10, 10]}
                />
                <Bar
                  dataKey="pending"
                  stackId="a"
                  fill="#3B82F6"
                  stroke="none"
                  barSize={20} // Adjust the width of the bars
                  radius={[10, 10, 10, 10]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Training Status Distribution */}
        <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700">
          <h3 className="text-lg font-medium dark:text-white text-gray-900 mb-4">
            Training Status Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(30 41 59)",
                    border: "none",
                    borderRadius: "0.5rem",
                    padding: "12px",
                  }}
                  labelStyle={{ color: "#fff", marginBottom: "4px" }}
                  itemStyle={{ color: "#fff", padding: "2px 0" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white mt-10 dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:border-dark-700">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center dark:border-dark-700">
          <h3 className="text-lg font-medium dark:text-white text-gray-900">
            Employee Training Status
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Employee Code
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Employee Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Assigned Modules
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Overall Progress
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {employeeData.map((employee, idx) => {
                const totalProgress =
                  employee.modules.length > 0
                    ? employee.modules.reduce(
                        (sum: any, module: any) => sum + module.progress,
                        0,
                      ) / employee.modules.length
                    : 0;

                return (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {employee.employeeCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-white">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-white">
                      {employee.modules.length}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          totalProgress === 100
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : totalProgress >= 50
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {totalProgress.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          className="lucide lucide-ellipsis-vertical"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal for Module Details */}
      {isModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium dark:text-white">
                Module Details - {selectedEmployee.name}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Calculate Overall Progress */}
            <div className="mt-4">
              <h4 className="text-md font-semibold dark:text-white mb-3">
                Overall Progress
              </h4>
              {selectedEmployee.modules.length > 0 ? (
                (() => {
                  const totalProgress =
                    selectedEmployee.modules.reduce(
                      (sum: any, module: any) => sum + module.progress,
                      0,
                    ) / selectedEmployee.modules.length;

                  const pieData = [
                    { name: "Completed", value: totalProgress },
                    { name: "Remaining", value: 100 - totalProgress },
                  ];

                  const COLORS = ["#10B981", "#3B82F6"];

                  return (
                    <div className="flex justify-center">
                      <PieChart width={200} height={200}>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </div>
                  );
                })()
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No modules assigned.
                </p>
              )}
            </div>

            {/* Modules Table */}
            <div className="mt-4">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Module
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                  {selectedEmployee.modules.map((module, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {module.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-white">
                        {module.category}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            module.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-600 dark:text-green-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-500 dark:text-blue-200"
                          }`}
                        >
                          {module.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-white">
                        {module.progress}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
