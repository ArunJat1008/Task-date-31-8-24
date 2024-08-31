const router = require("express").Router();
const userController = require("../controllers/user_controller");
const authjwt = require("../middlewares/auth_middleware");

router.post("/signUp", userController.signUp);
router.post("/login", userController.login);
router.get("/getMyProfile", authjwt, userController.getMyProfile);
router.post("/requestResetPassword", userController.requestResetPassword);
router.post("/resetPassword", userController.resetPassword);

module.exports = router;
