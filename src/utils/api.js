import axios from "axios";
const API_BASE_URL = "https://gaussconnect.com/api";

// Function to get the token for authentication
export const login = async () => {
  const response = await axios.post(
    `${API_BASE_URL}/login`,
    {
      email: "admin@lms.com",
      password: "admin123",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data.token;
};

// Function to get the dashboard data
export const getDashboardData = async (token) => {
  const response = await axios.get(
    `${API_BASE_URL}/admin/combined-stats-count`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

// Function to get total signups data
export const getTotalSignups = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/admin/total-signups`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Function to get total signups data
export const getCourseDistribution = async (token) => {
  const response = await axios.get(
    `${API_BASE_URL}/admin/course-distribution`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};

// Function to get the token for authentication
export const loginIntsructor = async () => {
  const response = await axios.post(
    `${API_BASE_URL}/login`,
    {
      email: "instructor@test.com", // Use instructor login credentials
      password: "instructor",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data.token;
};

// Function to get course status distribution data
export const getCourseStatusDistribution = async (token) => {
  const response = await axios.get(
    `${API_BASE_URL}/api/modules/status-distribution`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data; // Assuming the response contains status distribution data
};

// Function to get module counts data
export const getModuleCounts = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/api/modules/counts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data; // Assuming the response contains the counts
};

// Function to get client onboarding details
export const getClientOnboardingDetails = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/client/onboarding`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

// Function to create a new module
export const createModule = async (token, moduleData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/module/create`,
      moduleData,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error creating module:", error.response?.data || error);
    throw error;
  }
};

// Function to get all modules
export const getInstructorModules = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/instructor-modules`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching modules:", error.response?.data || error);
    throw error;
  }
};

export const deleteModule = async (token, moduleId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/api/module/${moduleId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

// Function to get module by ID (for editing course)
export const getModuleById = async (token, moduleId) => {
  const response = await axios.get(`${API_BASE_URL}/module/${moduleId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Function to update an existing course/module
export const updateModule = async (token, moduleId, moduleData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/module/${moduleId}`,
      moduleData,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating module:", error.response?.data || error);
    throw error;
  }
};

// Function to update an existing course/module
export const updateModulebyAdmin = async (token, moduleId, moduleData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/module/${moduleId}`,
      moduleData,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating module:", error.response?.data || error);
    throw error;
  }
};

// Function to get module by ID (for editing course)
export const getModuleByIdAdmin = async (token, moduleId) => {
  const response = await axios.get(`${API_BASE_URL}/admin/module/${moduleId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(response);
  return response.data;
};

// Function to get all courses
export const getAllCourses = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/courses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Assuming the response contains the list of courses
  } catch (error) {
    console.error("Error fetching courses:", error.response?.data || error);
    throw error;
  }
};

// Function to update the course status (approve and publish the course)
export const updateCourseStatus = async (token, courseId, status) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/courses/${courseId}/status`,
      { status }, // Status will be passed, e.g., "published"
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data; // Assuming the response contains the updated course status
  } catch (error) {
    console.error(
      "Error updating course status:",
      error.response?.data || error,
    );
    throw error;
  }
};

// Function to upload an image
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(
      `${API_BASE_URL}/upload/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    console.log(response, "response");

    return response.data; // Assuming response contains image URL or ID
  } catch (error) {
    console.error("Error uploading image:", error.response?.data || error);
    throw error;
  }
};
