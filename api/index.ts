import { createExpressApp } from "../server.js";

export default async (req: any, res: any) => {
  const app = await createExpressApp();
  return app(req, res);
};
