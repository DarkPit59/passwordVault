const express = require("express");
const router = express.Router();

const { verifyJWTToken } = require("../../middleware/jwt.middleware");
const authController = require("../controllers/auth.controller");
const authValidation = require("../validators/auth.validator");

router.post("/register",verifyJWTToken, authValidation.register, authController.register);



module.exports = router;