import api from "../api";
import type { Project, ProjectTask } from "@/types/project";

export const projectService = {
  createProject: async (data: Partial<Project>): Promise<Project> => {
    const response = await api.post("/projects", data);
    return response.data.data;
  },

  getMyProjects: async (): Promise<Project[]> => {
    const response = await api.get("/projects");
    return response.data.data;
  },

  getProjectById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data.data;
  },

  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    const response = await api.delete(`/projects/${id}`);
    return response.data.data;
  },

  createTask: async (projectId: string, data: Partial<ProjectTask>): Promise<ProjectTask> => {
    const response = await api.post(`/projects/${projectId}/tasks`, data);
    return response.data.data;
  },

  updateTask: async (projectId: string, taskId: string, data: Partial<ProjectTask>): Promise<ProjectTask> => {
    const response = await api.patch(`/projects/${projectId}/tasks/${taskId}`, data);
    return response.data.data;
  },

  deleteTask: async (projectId: string, taskId: string): Promise<void> => {
    const response = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    return response.data.data;
  },
};
