import { getQuery } from "https://deno.land/x/oak@v11.1.0/helpers.ts";
import { Router, Status } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { SessionGuard } from "../Middlewares.ts";
import { Order, OrderModel } from "../models/Order.ts";
import { z } from "https://deno.land/x/zod@v3.20.2/mod.ts";
import { UserModel } from "../models/User.ts";
import { MessageModel } from "../models/Message.ts";

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
  .put(
    "/:rid", //修改订单信息
    SessionGuard,
    async ({ request, response, params }) => {
      const orderPatch: Order = await request.body().value
      response.body = await OrderModel.findByIdAndUpdate(params.rid, orderPatch)
    }
  )
  .get(
    "/all", //获取所有订单,默认十个,通过 `/all?page=1&size=5`调整获取的数量
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
    "/:rid", //按订单id获取
    async ({ response, params }) => {
      response.body = await OrderModel.findById(params.rid)
    }
  )
  .get(
    "/star/:rid", //收藏
    SessionGuard,
    async ({ state, params }) => {
      const user = await UserModel.findById(state.userId)
      user?.stars?.addToSet(params.rid)
      await user?.save()
    }
  )
  .get(
    "/confirm/:rid", // 雇主确认
    SessionGuard,
    async ({ params, state, response, throw: _throw }) => {
      const order = await OrderModel.findById(params.rid)
      if (order?.uid != state.userId) _throw(Status.Forbidden, "你不是雇主")
      if (order?.workers?.toObject.length != order?.headCount) {
        _throw(Status.BadRequest, "人数不够,还不能确认！")
      }
      order!.status = '进行中'
      await order?.save()
      response.body = {
        message: "工人开始工作"
      }
    }
  )
  .get(
    "/apply/:rid", //工人接单
    SessionGuard,
    async ({ params, state, response, throw: _throw }) => {
      const order = await OrderModel.findById(params.rid)
      if (order?.workers?.toObject().length === order?.headCount) {
        _throw(Status.BadRequest, "人数已满")
      }
      const user = await UserModel.findById(state.userId)
      user?.works?.addToSet(order!._id) //把订单id加入到我的工作集合
      order?.workers?.addToSet(state.userId)
      order!.status = '待确认'
      await order?.save()
      await user?.save()
      response.body = {
        message: "接单成功"
      }
    }
  )
  .get(
    "/finished/:rid",//完成订单,
    SessionGuard,
    async ({ params, state, response }) => {
      const order = await OrderModel.findById(params.rid)
      order?.finishedWorkers?.addToSet(state.userId)
      if (order?.finishedWorkers?.toObject().length === order?.workers?.toObject().length) {
        const user = await UserModel.findById(order?.uid)
        user?.messages?.addToSet(await MessageModel.create({
          content: `订单 ${order?.title} 已完成！`
        }))
        await user?.save()

      }
      await order?.save()
      response.body = {
        message: "成功完成"
      }
    }
  )
  .get(
    "/drop/:rid",//取消订单,
    SessionGuard,
    async ({ params, response, throw: _throw }) => {
      const order = await OrderModel.findById(params.rid)
      if (order?.status === '已完成') _throw(Status.BadRequest, "已完成的订单不能取消")
      const user = await UserModel.findById(order?.uid)
      user?.messages?.addToSet(await MessageModel.create({
        content: `订单 ${order?.title} 已取消！`
      }))
      await order?.save()
      await user?.save()
      response.body = {
        message: "取消成功"
      }
    }
  )