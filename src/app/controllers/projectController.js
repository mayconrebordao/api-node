const express = require("express");

const authMiddleware = require("../middlewares/auth");

const Project = require("../models/Project");

const Task = require("../models/Task");

const router = express.Router();

router.use(authMiddleware);

// Route to get all projects in database.
router.get("/", async (req, res) => {
  try {
    // const projects = await  Project.find().populate('Tasks');
    // const projects = await Project.find().populate(["user", "tasks"]);
    // console.log(projects);

    // return res.status(200).send({
    //   projects: {
    //     title: projects.title,
    //     description: projects.description,
    //     user: {
    //       name: projects.User.name,
    //       email: projects.User.email
    //     },
    //     tasks: {
    //       title: projects.tasks.title
    //     }
    //   }
    // });

    Project.find()
      .populate(["user", "tasks"])
      .exec()
      .then(docs => {
        // console.log({ docs });

        const response = {
          projects: docs.map(doc => {
            // console.log({ a: doc.tasks. });

            return {
              title: doc.title,
              description: doc.description,
              user: {
                name: doc.user.name,
                email: doc.user.email
              },
              tasks: doc.tasks.map(task => {
                return {
                  title: task.title,
                  completed: task.completed
                };
              })
            };
          })
        };
        res
          .status(200)
          .send({ response: "Data found successfull", content: response });
      })
      .catch();
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .send({ error: "Intenal server error, cannot get all projects." });
  }
});

// Route to get just one project in database.
router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate(
      "tasks"
    );
    return res.status(200).send(project);
  } catch (error) {
    console.log(error.error);

    return res.status(404).send({ error: "Project not Found." });
  }
});

router.post("/", async (req, res) => {
  try {
    // console.log(req.body);
    console.log(req.userId);

    const { title, description, tasks } = req.body;
    const project = await Project.create({
      title,
      description,
      user: req.userId
    });
    await Task.remove({ project: project._id });

    await Promise.all(
      tasks.map(async task => {
        const projectTask = new Task({
          ...task,
          project: project._id,
          assignedTo: req.userId
        });
        // console.log({ projectTask });
        // printjson(projectTask);
        await projectTask.save();

        project.tasks.push(projectTask);
      })
    );
    await project.save();
    return res.status(200).send({ project });
  } catch (error) {
    console.log(error);

    return res.status(500).send({ error: "Cannot create project." });
  }
});

router.put("/:projectId", async (req, res) => {
  try {
    // console.log(req.body);

    const { title, description, tasks } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      {
        title,
        description
      },
      { new: true }
    );

    // console.log( project.tasks);
    // project.tasks = [];

    // await Task.remove({ project: project._id });
    // project.tasks = [];
    await Task.remove({ project: project._id });
    // console.log(project._id);

    await Promise.all(
      tasks.map(async task => {
        const projectTask = new Task({
          ...task,
          project: project._id,
          assignedTo: req.userId
        });
        await projectTask.save();
        project.tasks.push(projectTask);
      })
    );

    return res.status(200).send({ project });
  } catch (error) {
    console.log(error);

    return res.status(500).send({ error: "Cannot update project." });
  }
});

router.delete("/:projectId", async (req, res) => {
  try {
    await Project.findByIdAndRemove(req.params.projectId).populate("user");
    // console.log(project);

    return res.status(200).send({ error: "Porject delete successfull." });
  } catch (error) {
    return res
      .status(500)
      .send({ error: "Intenal server error, cannot delete project." });
  }
});

module.exports = app => app.use("/projects", router);
