import { checkMongoHealth } from "../controllers/healthController.js";
import { Router } from "express";

const router= Router();
router.route("/serverHealthCheck").get(checkMongoHealth);

export default router;
