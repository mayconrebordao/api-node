const mongoose = require("../../database");

const bcrypt = require("bcryptjs");

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true
  },
  description: {
    type: String,
    required: true
  },
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
  tasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
  }]
  ,
  crearedAt: {
    type: Date,
    default: Date.now
  }
});

ProjectSchema.pre("save", async function(next) {
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;

  next();
});

const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
