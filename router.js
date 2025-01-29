const express = require("express");
const router = express.Router();

const userRouter = require("./users/routes/routes");
const AdminRouter = require("./admin/routes/routes");

router.use("/user", userRouter);
router.use("/admin", AdminRouter);

module.exports = router;