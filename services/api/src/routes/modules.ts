import type { FastifyPluginAsync } from "fastify";

import { modules } from "../domain/modules.js";

export const modulesRoute: FastifyPluginAsync = async (app) => {
  app.get("/modules", async () => {
    return {
      items: modules
    };
  });
};
