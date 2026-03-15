import { baseProcedure, createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  getMetrics: baseProcedure.query(async () => {
    return {
      totalSubmissions: 2847,
      avgScore: 4.2,
    };
  }),
});

export type AppRouter = typeof appRouter;
