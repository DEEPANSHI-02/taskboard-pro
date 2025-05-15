const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authMiddleware = require("../middlewares/authMiddleware");

// Apply authentication middleware to all project routes
router.use(authMiddleware.protect);

// Create a new project
router.post("/", projectController.createProject);

// Get all projects for current user
router.get("/", projectController.getUserProjects);

// Get project by ID
router.get("/:projectId", projectController.getProjectById);

// Update project
router.put("/:projectId", projectController.updateProject);

// Delete project
router.delete("/:projectId", projectController.deleteProject);

// Invite user to project
router.post("/:projectId/invite", projectController.inviteUser);

// Accept project invitation
router.post(
  "/:projectId/accept-invitation/:token",
  projectController.acceptInvitation
);

// Update project statuses
router.put("/:projectId/statuses", projectController.updateProjectStatuses);

// Remove user from project
router.delete(
  "/:projectId/members/:userId",
  projectController.removeProjectMember
);

module.exports = router;
