const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, priority, projectId } = req.query;

    const where = {
      ...(req.user.role !== 'ADMIN' && { assigneeId: req.user.id }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(projectId && { projectId })
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, title: true } },
          assignee: { select: { id: true, name: true, email: true } }
        }
      }),
      prisma.task.count({ where })
    ]);

    res.json({
      tasks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: { select: { id: true, title: true, ownerId: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, projectId, assigneeId } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (req.user.role !== 'ADMIN' && project.ownerId !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || req.user.id
      },
      include: {
        project: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'ADMIN' && task.project.ownerId !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' });

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId })
      },
      include: {
        project: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'ADMIN' && task.project.ownerId !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' });

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
