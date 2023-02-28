import { getQuery } from "https://deno.land/x/oak@v11.1.0/helpers.ts";
import { Router, Status } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { UserModel } from "../models/User.ts";


const router = new Router();
export default router;

router
  .get(
    "/:uid",
    async ({ params, response }) => {
      const user = await UserModel.findById(params.uid).populate("comments")
      response.body = user?.comments
    }
  )