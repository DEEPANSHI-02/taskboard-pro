const express = require("express");
const router = express.Router();
const automationController = require("../controllers/automationController");
const authMiddleware = require("../middlewares/authMiddleware");

// Apply authentication middleware to all automation routes
router.use(authMiddleware.protect);

// Create a new automation
router.post("/", automationController.createAutomation);

// Get automations for a project
router.get("/project/:projectId", automationController.getProjectAutomations);

// Get automation by ID
router.get("/:automationId", automationController.getAutomationById);

// Update automation
router.put("/:automationId", automationController.updateAutomation);

// Delete automation
router.delete("/:automationId", automationController.deleteAutomation);

module.exports = router;
