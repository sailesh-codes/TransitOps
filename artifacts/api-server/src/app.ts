import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import healthRouter from "./routes/health";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", healthRouter);

app.use(
  clerkMiddleware((req) => {
    const key = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY || "";
    let pubKey = key;
    try {
      pubKey = publishableKeyFromHost(getClerkProxyHost(req) ?? "", key) || key;
    } catch (e) {
      pubKey = key;
    }
    return {
      publishableKey: pubKey,
    };
  }),
);

app.use("/api", router);

// Global error handler — turns thrown errors (Zod parse failures, DB errors,
// unexpected nulls, etc.) into a JSON 500 with a useful message instead of
// Express's default HTML "Internal Server Error" page. Without this every
// thrown error is opaque from the browser.
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: express.NextFunction,
  ) => {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    logger.error({ err }, "Unhandled error in request");
    
    // TEMPORARY: Write error to a file so we can read it
    import("node:fs").then(fs => {
      fs.appendFileSync("c:/Users/NIKELESH/OneDrive/Documents/TransitOps/artifacts/api-server/error.log", JSON.stringify({ message, stack }) + "\\n");
    });

    res.status(500).json({
      error: "Internal Server Error",
      message,
      ...(process.env.NODE_ENV !== "production" && stack ? { stack } : {}),
    });
  },
);

export default app;
