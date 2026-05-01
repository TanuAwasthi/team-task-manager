import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, dueDate, priority, assignee } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.owner.toString() === req.user.id ||
      project.members.some(m => m.userId.toString() === req.user.id);

    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }

    const newTask = await Task.create({
      title,
      description,
      project: projectId,
      createdBy: req.user.id,
      assignee: assignee || null,
      dueDate: dueDate || null,
      priority: priority || 'medium',
    });

    await newTask.populate('assignee', 'firstName lastName email');
    await newTask.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      message: 'Task created successfully',
      task: newTask,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.owner.toString() === req.user.id ||
      project.members.some(m => m.userId.toString() === req.user.id);

    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assignee, dueDate } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isMember = project.owner.toString() === req.user.id ||
      project.members.some(m => m.userId.toString() === req.user.id);

    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    task.updatedAt = Date.now();

    await task.save();
    await task.populate('assignee', 'firstName lastName email');
    await task.populate('createdBy', 'firstName lastName email');

    res.status(200).json({
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

export const getTaskStats = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.owner.toString() === req.user.id ||
      project.members.some(m => m.userId.toString() === req.user.id);

    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }

    const stats = await Task.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          overdue: { $sum: { $cond: ['$isOverdue', 1, 0] } },
        },
      },
    ]);

    res.status(200).json({
      stats: stats[0] || { total: 0, completed: 0, inProgress: 0, todo: 0, overdue: 0 },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching task stats', error: error.message });
  }
};

export const getOverdueTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      isOverdue: true,
      status: { $ne: 'completed' },
      project: { $in: req.user.assignedProjects || [] },
    })
      .populate('project', 'name')
      .populate('assignee', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    res.status(200).json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching overdue tasks', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isAdmin = project.owner.toString() === req.user.id ||
      project.members.some(m => m.userId.toString() === req.user.id && m.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admin can delete tasks' });
    }

    await Task.deleteOne({ _id: taskId });

    res.status(200).json({
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};
