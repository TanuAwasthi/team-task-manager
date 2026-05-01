import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const newProject = await Project.create({
      name,
      description,
      owner: req.user.id,
      members: [{ userId: req.user.id, role: 'admin' }],
    });

    res.status(201).json({
      message: 'Project created successfully',
      project: newProject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'members.userId': req.user.id },
      ],
    })
      .populate('owner', 'firstName lastName email')
      .populate('members.userId', 'firstName lastName email');

    res.status(200).json({ projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('owner', 'firstName lastName email')
      .populate('members.userId', 'firstName lastName email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner._id.toString() === req.user.id;
    const isMember = project.members.some(m => m.userId._id.toString() === req.user.id);

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isAdmin = project.owner.toString() === req.user.id ||
      project.members.some(m => m.userId.toString() === req.user.id && m.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admin can update project' });
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    project.updatedAt = Date.now();

    await project.save();

    res.status(200).json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
};

export const addMemberToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, email, role = 'member' } = req.body;

    if (!userId && !email) {
      return res.status(400).json({ message: 'User ID or email is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can add members' });
    }

    let memberId = userId;
    if (!memberId) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      memberId = user._id.toString();
    }

    if (project.members.some(m => m.userId.toString() === memberId)) {
      return res.status(400).json({ message: 'User already a member' });
    }

    project.members.push({ userId: memberId, role });
    await project.save();

    await project.populate('members.userId', 'firstName lastName email');

    res.status(200).json({
      message: 'Member added successfully',
      project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding member', error: error.message });
  }
};

export const removeMemberFromProject = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can remove members' });
    }

    project.members = project.members.filter(
      m => m.userId.toString() !== userId
    );
    await project.save();

    res.status(200).json({
      message: 'Member removed successfully',
      project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing member', error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }

    await Project.deleteOne({ _id: projectId });
    await Task.deleteMany({ project: projectId });

    res.status(200).json({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};
