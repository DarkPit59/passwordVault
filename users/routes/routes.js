const express = require("express");
      const router = express.Router();

      // Import all your routes here. This is an example: create auth.route.js and import it here.
       const authRouter = require("./auth.route");   
       router.use("/auth", authRouter);

       module.exports = router;