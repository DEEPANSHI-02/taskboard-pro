const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authMiddleware = require("../middlewares/authMiddleware");

// Apply authentication middleware to all task routes
router.use(authMiddleware.protect);

// Create a new task
router.post("/", taskController.createTask);

// Get tasks for a project
router.get("/project/:projectId", taskController.getProjectTasks);

// Get task by ID
router.get("/:taskId", taskController.getTaskById);

// Update task
router.put("/:taskId", taskController.updateTask);

// Delete task
router.delete("/:taskId", taskController.deleteTask);

// Add comment to task
router.post("/:taskId/comments", taskController.addComment);

module.exports = router;
