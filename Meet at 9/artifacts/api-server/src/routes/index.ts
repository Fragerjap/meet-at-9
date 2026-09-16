import { Router, type IRouter } from "express";
import healthRouter from "./health";
import meetingRouter from "./meeting";

const router: IRouter = Router();

router.use(healthRouter);
router.use(meetingRouter);

export default router;
