import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  Clock,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cross,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  loginIntsructor,
  getCourseStatusDistribution,
  getModuleCounts,
  getInstructorModules,
  deleteModule,
} from "../../utils/api.js";
import { MdCancel } from "react-icons/md";

const courseEngagementData = [
  { month: "Jan", students: 65 },
  { month: "Feb", students: 85 },
  { month: "Mar", students: 120 },
  { month: "Apr", students: 175 },
  { month: "May", students: 230 },
  { month: "Jun", students: 280 },
  { month: "July", students: 175 },
  { month: "Aug", students: 85 },
  { month: "Sept", students: 40 },
  { month: "Oct", students: 55 },
  { month: "Nov", students: 200 },
  { month: "Dec", students: 80 },
];

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F43F5E", // Rose
  "#A855F7", // Violet
  "#22C55E", // Emerald
  "#EAB308", // Yellow
  "#C026D3", // Fuchsia
  "#4ADE80", // Light Green
  "#60A5FA", // Light Blue
  "#FB923C", // Orange
];

const categories = [
  "All Categories",
  "Compliance",
  "Professional Ethics",
  "Management",
  "Technical",
  "Soft Skills",
];

const MetricCard = ({ icon: Icon, title, value, trend }) => (
  <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700">
    <div className="flex items-center justify-between">
      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
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
    <h3 className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
      {title}
    </h3>
    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
      {value}
    </p>
  </div>
);

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  // const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  // State to store fetched data
  const [courseStatusData, setCourseStatusData] = useState([]);
  const [moduleCounts, setModuleCounts] = useState(null);
  const [coursesData, setCoursesData] = useState([]);

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = coursesData.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );

  const Pagination = () => {
    const pageNumbers = Math.ceil(coursesData.length / coursesPerPage);

    return (
      <div className="flex flex-col items-center justify-center mt-6 pb-6">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 disabled:opacity-50 flex items-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: pageNumbers }, (_, i) => i + 1).map(
            (number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`px-3 py-1 rounded-full border ${
                  currentPage === number
                    ? "bg-blue-500 text-white"
                    : "border-gray-200 dark:border-dark-700"
                }`}
              >
                {number}
              </button>
            )
          )}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, pageNumbers))
            }
            disabled={currentPage === pageNumbers}
            className="px-3 py-1 rounded-lg disabled:opacity-50 flex items-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {`${indexOfFirstCourse + 1}-${Math.min(
            indexOfLastCourse,
            coursesData.length
          )} of ${coursesData.length} items`}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      // Get token first
      const token = await loginIntsructor();

      // Fetch course status distribution and module counts
      const statusDistribution = await getCourseStatusDistribution(token);
      const counts = await getModuleCounts(token);
      setCourseStatusData(statusDistribution);
      setModuleCounts(counts);

      // Fetch courses
      const courses = await getInstructorModules(token);
      setCoursesData(courses);
    };

    fetchData();
  }, []);

  // const handleCreateCourse = (courseId:any) => {
  //   navigate("/courses/create");
  // };

  const handleEditCourse = (courseId: any) => {
    if (!courseId) {
      console.error("No course ID provided");
      return;
    }
    navigate(`/courses/edit/${courseId}`);
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const token = await loginIntsructor();
      await deleteModule(token, courseToDelete);

      setCoursesData((prevCourses) =>
        prevCourses.filter((course: any) => course._id !== courseToDelete)
      );

      setShowConfirmModal(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const confirmDelete = (courseId: any) => {
    setCourseToDelete(courseId);
    setShowConfirmModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg text-center w-80 animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirm Deletion
            </h2>
            <p className="my-4 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this course? This action cannot be
              undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Welcome Message and Create Button */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome, Instructor
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your courses and track their performance
          </p>
        </div>
        {/* <button
          onClick={handleCreateCourse}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create a New Course
        </button> */}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={BookOpen}
          title="Total Courses"
          value={moduleCounts?.total || "0"}
          trend="+12 this month"
        />
        <MetricCard
          icon={CheckCircle}
          title="Published Courses"
          value={moduleCounts?.published || "0"}
          trend="+5 this week"
        />
        <MetricCard
          icon={Clock}
          title="Pending Approval"
          value={moduleCounts?.pending || "0"}
        />
        <MetricCard
          icon={MdCancel}
          title="Rejected Course"
          value={
            moduleCounts?.total -
              (moduleCounts?.published + moduleCounts?.pending) || "0"
          }
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Status Distribution */}
        <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Course Status Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  fill="#8884d8"
                >
                  {courseStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Engagement Trend */}
        <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Student Engagement Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={courseEngagementData}
                // barCategoryGap={20}
              >
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar
                  barSize={20}
                  dataKey="students"
                  fill="#3B82F6"
                  radius={[10, 10, 10, 10]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-dark-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Your Courses
            </h3>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="pl-10 pr-4 py-2 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {currentCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 overflow-hidden"
            >
              <img
                src={course.imgUrl}
                alt={course.title}
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {course.category}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.status === "published"
                        ? "bg-green-100 text-green-800"
                        : course.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {course.title}
                </h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated:{" "}
                  {new Date(course.updatedAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEditCourse(course._id)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => confirmDelete(course._id)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center pb-6">
          <Pagination />
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
