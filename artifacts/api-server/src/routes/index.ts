import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import vehiclesRouter from "./vehicles";
import driversRouter from "./drivers";
import tripsRouter from "./trips";
import maintenanceRouter from "./maintenance";
import fuelLogsRouter from "./fuelLogs";
import expensesRouter from "./expenses";
import dashboardRouter from "./dashboard";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(vehiclesRouter);
router.use(driversRouter);
router.use(tripsRouter);
router.use(maintenanceRouter);
router.use(fuelLogsRouter);
router.use(expensesRouter);
router.use(dashboardRouter);
router.use(reportsRouter);

export default router;
