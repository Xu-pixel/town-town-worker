import { Router, Status } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { SessionGuard } from "../Middlewares.ts";
import { Comment, CommentModel } from "../models/Comment.ts";
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
  .post(
    "/:uid",
    SessionGuard,
    async ({ request, response, params }) => {
      const comment: Comment = await request.body().value
      comment.uid = params.uid
      response.body = await CommentModel.create(comment)
    }
  )