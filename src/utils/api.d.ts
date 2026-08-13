declare module "../../utils/api.js" {
  export const login: () => Promise<string>;
  export const loginIntsructor: () => Promise<string>;
  export const getDashboardData: (token: string) => Promise<any>;
  export const getTotalSignups: (token: string) => Promise<any>;
  export const getCourseDistribution: (token: string) => Promise<any>;
  export const getCourseStatusDistribution: (token: string) => Promise<any>;
  export const getModuleCounts: (token: string) => Promise<any>;
  export const getClientOnboardingDetails: (token: string) => Promise<any[]>;
  export const createModule: (token: string, moduleData: any) => Promise<any>;
  export const getInstructorModules: (token: string) => Promise<any>;
  export const deleteModule: (token: string, moduleId: string) => Promise<any>;
  export const getModuleById: (token: string, moduleId: string) => Promise<any>;
  export const updateModule: (token: string, moduleId: string, moduleData: any) => Promise<any>;
  export const updateModulebyAdmin: (token: string, moduleId: string, moduleData: any) => Promise<any>;
  export const getModuleByIdAdmin: (token: string, moduleId: string) => Promise<any>;
  export const getAllCourses: (token: string) => Promise<any[]>;
  export const updateCourseStatus: (token: string, courseId: string, status: string) => Promise<any>;
  export const uploadImage: (file: File) => Promise<any>;
}
