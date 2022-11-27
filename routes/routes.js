const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

router.post("/register", async (req, res) => {
  console.log(req.body);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    age: req.body.age,
  });

  const result = await user.save();

  const { password, ...data } = result.toJSON();
  res.send(data);
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).send({
      message: "User not found",
    });
  }
  if (!(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(404).send({
      message: "Invalid credentials",
    });
  }
  //tao token
  const token = jwt.sign({ _id: user._id }, "secret");

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.send({
    message: "success",
  });
});

router.get("/user", async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];

    const claims = jwt.verify(cookie, "secret");

    if (!claims) {
      return res.status(401).send({
        message: "Unauthenticated!",
      });
    }
    const user = await User.findOne({ _id: claims._id });

    const { password, ...data } = user.toJSON();

    res.send(data);
  } catch (error) {
    return res.status(401).send({
      message: "Unauthenticated",
    });
  }
});

router.post("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.send({
    message: "Logged out!",
  });
});

router.get("/edit/:id", async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  res.json(user);
});

router.put("/edit/:id", async (req, res) => {
  await User.updateOne(
    { _id: req.params.id },
    {
      name: req.body.name,
      email: req.body.email,
      age: req.body.age,
      password: req.body.password,
    }
  );
  res.json(true);
});

router.get("/", async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

router.delete("/:id", async (req, res) => {
  await User.deleteOne({ _id: req.params.id });
  res.status(200).send();
});

module.exports = router;
