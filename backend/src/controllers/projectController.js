const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = req.user.role === 'ADMIN' ? {} : { ownerId: req.user.id };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } }
        }
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      projects,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (req.user.role !== 'ADMIN' && project.ownerId !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' });

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const project = await prisma.project.create({
      data: { title, description, ownerId: req.user.id },
      include: {
        owner: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (req.user.role !== 'ADMIN' && project.ownerId !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' });

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status })
      },
      include: {
        owner: { select: { id: true, name: true, email: true } }
      }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (req.user.role !== 'ADMIN' && project.ownerId !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' });

    await prisma.task.deleteMany({ where: { projectId: req.params.id } });
    await prisma.project.delete({ where: { id: req.params.id } });

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};