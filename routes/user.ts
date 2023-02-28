import { Router, Status } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { SessionGuard } from "../Middlewares.ts";
import { OrderModel } from "../models/Order.ts";
import { UserModel } from "../models/User.ts";
import { sessions } from "../Sessions.ts";

const router = new Router();
export default router;

router
  .post(
    "/login/:code", //用户登录
    async ({ params, throw: _throw, response }) => {
      const dataFromWx = await fetch(
        `https://api.weixin.qq.com/sns/jscode2session?appid=${Deno.env.get("APP_ID")
        }&secret=${Deno.env.get("APP_SECRET")
        }&js_code=${params.code}&grant_type=authorization_code`,
      ).then((res) => res.json());
      console.log(dataFromWx);
      if (dataFromWx.errcode) {
        _throw(Status.BadRequest);
      }
      let user = await UserModel.findOne({ wxOpenId: dataFromWx.openid });
      if (!user) { //第一次登录
        const token = crypto.randomUUID();
        user = await UserModel.create({
          wxOpenId: dataFromWx.openid,
          name: "微信用户" + crypto.randomUUID(),
          token,
        });
      }
      sessions.set(user.token, user.id); //刷新会话
      response.body = {
        token: user.token,
      };
    },
  )
  .get(
    "/publish/:uid",//按用户获取发布的订单
    async (ctx) => {
      ctx.response.body = await OrderModel.find({ uid: ctx.params.uid })
        .populate({ path: 'workers', select: "name" }) //取工人数组的时候把名字取出
    }
  )
  .get(
    "my-works/:uid", //获取用户参与的订单
    async (ctx) => {
      ctx.response.body = (await UserModel.findById(ctx.params.uid))?.works
    }
  )
  .get(
    "/", //获取所有用户信息
    SessionGuard,
    async ({ state, response }) => {
      const user = await UserModel.findById(state.userId);
      response.body = user
    },
  )
