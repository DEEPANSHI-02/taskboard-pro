const Project = require('../models/project.model');
const User = require('../models/user.model');
const crypto = require('crypto');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const project = new Project({
      title,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }]
    });
    
    await project.save();
    
    return res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Create Project Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
};

// Get all projects for current user
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id
    }).populate('owner', 'name email profilePicture');
    
    return res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get Projects Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'name email profilePicture')
      .populate('members.user', 'name email profilePicture');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is a member
    const isMember = project.members.some(member => 
      member.user._id.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get Project Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can update project details'
      });
    }
    
    project.title = title || project.title;
    project.description = description || project.description;
    
    await project.save();
    
    return res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Update Project Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can delete the project'
      });
    }
    
    await Project.deleteOne({ _id: project._id });
    
    // TODO: Delete associated tasks and automations
    
    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete Project Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
};

// Invite user to project
exports.inviteUser = async (req, res) => {
  try {
    const { email } = req.body;
    const projectId = req.params.projectId;
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is already a member
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const alreadyMember = project.members.some(member => 
        member.user.toString() === existingUser._id.toString()
      );
      
      if (alreadyMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a member of this project'
        });
      }
    }
    
    // Check for existing invitation
    const existingInvite = project.invites.find(invite => invite.email === email);
    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'User has already been invited'
      });
    }
    
    // Generate invitation token
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days
    
    // Add invitation to project
    project.invites.push({
      email,
      token,
      expiresAt
    });
    
    await project.save();
    
    // TODO: Send email with invitation link
    
    return res.status(200).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        inviteLink: `/join-project/${projectId}/${token}`,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Invite User Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send invitation'
    });
  }
};

// Accept project invitation
exports.acceptInvitation = async (req, res) => {
  try {
    const { projectId, token } = req.params;
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Find invitation
    const inviteIndex = project.invites.findIndex(
      invite => invite.token === token && invite.email === req.user.email
    );
    
    if (inviteIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invitation'
      });
    }
    
    // Check if invitation has expired
    const invite = project.invites[inviteIndex];
    if (new Date() > new Date(invite.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'Invitation has expired'
      });
    }
    
    // Add user to project members
    project.members.push({
      user: req.user._id,
      role: 'editor'
    });
    
    // Remove the invitation
    project.invites.splice(inviteIndex, 1);
    
    await project.save();
    
    return res.status(200).json({
      success: true,
      message: 'Successfully joined project',
      data: project
    });
  } catch (error) {
    console.error('Accept Invitation Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to join project'
    });
  }
};

// Update project statuses
exports.updateProjectStatuses = async (req, res) => {
  try {
    const { statuses } = req.body;
    const projectId = req.params.projectId;
    
    if (!Array.isArray(statuses)) {
      return res.status(400).json({
        success: false,
        message: 'Statuses must be an array'
      });
    }
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can update project statuses'
      });
    }
    
    // Update statuses
    project.statuses = statuses.map((status, index) => ({
      name: status.name,
      order: status.order || index
    }));
    
    await project.save();
    
    return res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Update Statuses Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update project statuses'
    });
  }
};

// Remove user from project
exports.removeProjectMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const projectId = req.params.projectId;
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can remove members'
      });
    }
    
    // Cannot remove the owner
    if (project.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project owner'
      });
    }
    
    // Find member index
    const memberIndex = project.members.findIndex(
      member => member.user.toString() === userId
    );
    
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this project'
      });
    }
    
    // Remove member
    project.members.splice(memberIndex, 1);
    
    await project.save();
    
    return res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: project
    });
  } catch (error) {
    console.error('Remove Member Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove member'
    });
  }
};