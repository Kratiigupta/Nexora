import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/helpers";
import { ProjectStatus, TaskStatus, TaskPriority, TeamMemberRole } from "@prisma/client";

/**
 * POST /api/v1/projects
 * Create a new project.
 */
export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { teamId, title, description, status, repoUrl, liveUrl } = req.body;

    if (teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId } },
      });
      if (!membership) {
        throw ApiError.forbidden("You must be a confirmed member of the team to create a project for it");
      }
    }

    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          teamId: teamId || null,
          title,
          description,
          status: (status as ProjectStatus) || ProjectStatus.planning,
          repoUrl: repoUrl || null,
          liveUrl: liveUrl || null,
          createdBy: userId,
        },
      });

      await tx.activityLog.create({
        data: {
          userId,
          action: "project_created",
          description: `Created project ${title}`,
          metadata: { projectId: newProject.id, projectTitle: title, teamId: newProject.teamId },
        },
      });

      return newProject;
    });

    sendSuccess(res, project, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/projects
 * Get projects accessible to the current user.
 */
export const getMyProjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get user's teams
    const memberships = await prisma.teamMember.findMany({
      where: { userId },
      select: { teamId: true },
    });
    const teamIds = memberships.map((m) => m.teamId);

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { createdBy: userId, teamId: null },
          { teamId: { in: teamIds } },
        ],
      },
      include: {
        creator: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
        team: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    sendSuccess(res, projects);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/projects/:id
 * Get a specific project.
 */
export const getProjectById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        creator: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
        team: { select: { id: true, name: true, avatarUrl: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) throw ApiError.notFound("Project");

    // Authorization check
    if (project.teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: project.teamId, userId } },
      });
      if (!membership) throw ApiError.forbidden("You do not have access to this team's project");
    } else {
      if (project.createdBy !== userId) throw ApiError.forbidden("You do not have access to this project");
    }

    sendSuccess(res, project);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/projects/:id
 * Update a specific project.
 */
export const updateProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const userId = req.user!.id;
    const { title, description, status, repoUrl, liveUrl } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw ApiError.notFound("Project");

    // Authorization check
    if (project.teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: project.teamId, userId } },
      });
      if (!membership) throw ApiError.forbidden("You do not have access to this team's project");
      
      if (project.createdBy !== userId && membership.role !== TeamMemberRole.owner && membership.role !== TeamMemberRole.admin) {
        throw ApiError.forbidden("Only the project creator or team admins can update this project");
      }
    } else {
      if (project.createdBy !== userId) throw ApiError.forbidden("Only the project creator can update this project");
    }

    const updatedProject = await prisma.$transaction(async (tx) => {
      const p = await tx.project.update({
        where: { id: projectId },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status: status as ProjectStatus }),
          ...(repoUrl !== undefined && { repoUrl: repoUrl || null }),
          ...(liveUrl !== undefined && { liveUrl: liveUrl || null }),
        },
      });

      await tx.activityLog.create({
        data: {
          userId,
          action: "project_updated",
          description: `Updated project ${p.title}`,
          metadata: { projectId: p.id, projectTitle: p.title },
        },
      });

      return p;
    });

    sendSuccess(res, updatedProject);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/projects/:id
 * Delete a specific project.
 */
export const deleteProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw ApiError.notFound("Project");

    // Authorization check
    if (project.teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: project.teamId, userId } },
      });
      if (!membership) throw ApiError.forbidden("You do not have access to this team's project");
      
      if (project.createdBy !== userId && membership.role !== TeamMemberRole.owner && membership.role !== TeamMemberRole.admin) {
        throw ApiError.forbidden("Only the project creator or team admins can delete this project");
      }
    } else {
      if (project.createdBy !== userId) throw ApiError.forbidden("Only the project creator can delete this project");
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/projects/:id/tasks
 * Create a new task for a project.
 */
export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const userId = req.user!.id;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw ApiError.notFound("Project");

    // Authorization check
    if (project.teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: project.teamId, userId } },
      });
      if (!membership) throw ApiError.forbidden("You do not have access to this team's project");

      if (assignedTo) {
        const assigneeMembership = await prisma.teamMember.findUnique({
          where: { teamId_userId: { teamId: project.teamId, userId: assignedTo } },
        });
        if (!assigneeMembership) throw ApiError.badRequest("Assignee must be a member of the team");
      }
    } else {
      if (project.createdBy !== userId) throw ApiError.forbidden("You do not have access to this project");
      if (assignedTo && assignedTo !== userId) {
        throw ApiError.badRequest("Cannot assign tasks to other users in a standalone project");
      }
    }

    const task = await prisma.projectTask.create({
      data: {
        projectId,
        title,
        description,
        status: (status as TaskStatus) || TaskStatus.todo,
        priority: (priority as TaskPriority) || TaskPriority.medium,
        assignedTo: assignedTo || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    sendSuccess(res, task, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/projects/:id/tasks/:taskId
 * Update a specific task.
 */
export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const taskId = req.params.taskId as string;
    const userId = req.user!.id;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw ApiError.notFound("Project");

    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
    });
    if (!task) throw ApiError.notFound("Task");
    if (task.projectId !== projectId) throw ApiError.badRequest("Task does not belong to this project");

    // Authorization check
    if (project.teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: project.teamId, userId } },
      });
      if (!membership) throw ApiError.forbidden("You do not have access to this team's project");

      if (assignedTo !== undefined && assignedTo !== null) {
        const assigneeMembership = await prisma.teamMember.findUnique({
          where: { teamId_userId: { teamId: project.teamId, userId: assignedTo } },
        });
        if (!assigneeMembership) throw ApiError.badRequest("Assignee must be a member of the team");
      }
    } else {
      if (project.createdBy !== userId) throw ApiError.forbidden("You do not have access to this project");
      if (assignedTo !== undefined && assignedTo !== null && assignedTo !== userId) {
        throw ApiError.badRequest("Cannot assign tasks to other users in a standalone project");
      }
    }

    const updatedTask = await prisma.$transaction(async (tx) => {
      const t = await tx.projectTask.update({
        where: { id: taskId },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status: status as TaskStatus }),
          ...(priority !== undefined && { priority: priority as TaskPriority }),
          ...(assignedTo !== undefined && { assignedTo }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        },
      });

      if (status === TaskStatus.done && task.status !== TaskStatus.done) {
        await tx.activityLog.create({
          data: {
            userId,
            action: "task_completed",
            description: `Completed task ${t.title} in project ${project.title}`,
            metadata: { taskId: t.id, taskTitle: t.title, projectId: project.id },
          },
        });
      }

      return t;
    });

    sendSuccess(res, updatedTask);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/projects/:id/tasks/:taskId
 * Delete a specific task.
 */
export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const taskId = req.params.taskId as string;
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw ApiError.notFound("Project");

    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
    });
    if (!task) throw ApiError.notFound("Task");
    if (task.projectId !== projectId) throw ApiError.badRequest("Task does not belong to this project");

    // Authorization check
    if (project.teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: project.teamId, userId } },
      });
      if (!membership) throw ApiError.forbidden("You do not have access to this team's project");
      
      // For tasks, let's say any confirmed team member can delete a task, or maybe just the project creator and team admins
      // But the prompt says: "project creator or team owner/admin OR according to existing project/task authorization conventions".
      // Let's stick to creator/admins for deletion to be safe, or allow the assignee to delete it.
      // I'll allow creator, team admin/owner, or the task assignee.
      const isCreator = project.createdBy === userId;
      const isAdminOrOwner = membership.role === TeamMemberRole.admin || membership.role === TeamMemberRole.owner;
      const isAssignee = task.assignedTo === userId;

      if (!isCreator && !isAdminOrOwner && !isAssignee) {
        throw ApiError.forbidden("Only the project creator, team admins, or the assignee can delete this task");
      }
    } else {
      if (project.createdBy !== userId) throw ApiError.forbidden("You do not have access to this project");
    }

    await prisma.projectTask.delete({
      where: { id: taskId },
    });

    sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};
