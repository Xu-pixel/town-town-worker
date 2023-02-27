import { getQuery } from "https://deno.land/x/oak@v11.1.0/helpers.ts";
import { Router, Status } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { SessionGuard } from "../Middlewares.ts";
import { Order, OrderModel } from "../models/Order.ts";
import { z } from "https://deno.land/x/zod@v3.20.2/mod.ts";

const router = new Router();
export default router;


router
  .post(
    "/",
    SessionGuard,
    async ({ request, response, state }) => {
      const formData: Order = await request.body().value
      formData.uid = state.userId
      const order = await OrderModel.create(formData)
      response.body = order
    }
  )
  .get(
    "/all",
    async (ctx) => {
      const params = getQuery(ctx, { mergeParams: true })
      const page = z.coerce.number().parse(params.page || 0)
      const size = z.coerce.number().parse(params.size || 10)
      ctx.response.body = await OrderModel.find()
        .skip(page * size)
        .limit(size)
    }
  )
  .get(
    "/:id",
    async ({ response, params }) => {
      response.body = await OrderModel.findById(params.id)
    }
  )