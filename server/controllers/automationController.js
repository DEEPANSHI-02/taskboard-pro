const Automation = require("../models/automationModel");
const Project = require("../models/projectModel");

// Create a new automation
exports.createAutomation = async (req, res) => {
  try {
    const { name, projectId, trigger, actions } = req.body;

    // Verify project exists and user is owner
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can create automations",
      });
    }

    // Validate trigger
    if (!trigger || !trigger.type) {
      return res.status(400).json({
        success: false,
        message: "Trigger type is required",
      });
    }

    // Validate actions
    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one action is required",
      });
    }

    // Create automation
    const automation = new Automation({
      name,
      project: projectId,
      createdBy: req.user._id,
      trigger,
      actions,
      isActive: true,
    });

    await automation.save();

    return res.status(201).json({
      success: true,
      data: automation,
    });
  } catch (error) {
    console.error("Create Automation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create automation",
    });
  }
};

// Get automations for a project
exports.getProjectAutomations = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Get automations
    const automations = await Automation.find({ project: projectId })
      .populate("createdBy", "name email profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: automations,
    });
  } catch (error) {
    console.error("Get Automations Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch automations",
    });
  }
};

// Get automation by ID
exports.getAutomationById = async (req, res) => {
  try {
    const { automationId } = req.params;

    const automation = await Automation.findById(automationId).populate(
      "createdBy",
      "name email profilePicture"
    );

    if (!automation) {
      return res.status(404).json({
        success: false,
        message: "Automation not found",
      });
    }

    // Verify project exists and user is a member
    const project = await Project.findById(automation.project);
    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: automation,
    });
  } catch (error) {
    console.error("Get Automation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch automation",
    });
  }
};

// Update automation
exports.updateAutomation = async (req, res) => {
  try {
    const { automationId } = req.params;
    const { name, trigger, actions, isActive } = req.body;

    const automation = await Automation.findById(automationId);

    if (!automation) {
      return res.status(404).json({
        success: false,
        message: "Automation not found",
      });
    }

    // Verify project exists and user is owner
    const project = await Project.findById(automation.project);
    const isOwner = project.owner.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can update automations",
      });
    }

    // Update automation
    if (name) automation.name = name;
    if (trigger) automation.trigger = trigger;
    if (actions) automation.actions = actions;
    if (isActive !== undefined) automation.isActive = isActive;

    await automation.save();

    return res.status(200).json({
      success: true,
      data: automation,
    });
  } catch (error) {
    console.error("Update Automation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update automation",
    });
  }
};

// Delete automation
exports.deleteAutomation = async (req, res) => {
  try {
    const { automationId } = req.params;

    const automation = await Automation.findById(automationId);

    if (!automation) {
      return res.status(404).json({
        success: false,
        message: "Automation not found",
      });
    }

    // Verify project exists and user is owner
    const project = await Project.findById(automation.project);
    const isOwner = project.owner.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can delete automations",
      });
    }

    await Automation.deleteOne({ _id: automation._id });

    return res.status(200).json({
      success: true,
      message: "Automation deleted successfully",
    });
  } catch (error) {
    console.error("Delete Automation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete automation",
    });
  }
};
