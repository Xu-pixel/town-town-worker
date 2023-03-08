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
    "/all",
    async (ctx) => {
      ctx.response.body = await OrderModel.find().exec()
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
    async ({ state, params, response }) => {
      const user = await UserModel.findById(state.userId)
      if (!user) return
      user.stars?.addToSet(params.rid)
      await user.save()
      response.body = await OrderModel.findById(params.rid)
    }
  )
  .get(
    "/cancel-star/:rid", //取消收藏
    SessionGuard,
    async ({ state, params, response }) => {
      const user = (await UserModel.findById(state.userId))!
      user.stars?.remove(params.rid)
      await user.save()
      response.body = await OrderModel.findById(params.rid)
    }
  )
  .get(
    "/confirm/:rid", // 雇主确认开工
    SessionGuard,
    async ({ params, state, response, throw: _throw }) => {
      const order = await OrderModel.findById(params.rid).populate('workers')
      if (!order) return
      if (order.uid != state.userId) _throw(Status.Forbidden, "你不是雇主")
      if (order.workers?.toObject().length != order?.headCount) {
        _throw(Status.BadRequest, "人数不够,还不能确认！")
      }
      order.status = '进行中'
      const workerNames = []
      if (order.workers) {
        for (const worker of order.workers?.toObject()) {
          worker.messages.addToSet(await MessageModel.create({
            title: '申请已通过',
            content: `订单${order.id}申请已同意，请于约定时间进行工作！`,
            type: 1,
            rid: order.id
          }))
          workerNames.push(worker.name)
          await worker.save()
        }
      }

      const user = (await UserModel.findById(state.userId))!
      user.messages?.addToSet(await MessageModel.create({
        title: '已同意',
        content: `您的订单${order.id}已被工人${workerNames}接收`,
        rid: order.id,
        type: 2
      }))
      order.status = '进行中'
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
      const order = (await OrderModel.findById(params.rid))!
      if (order.workers?.toObject().length === order.headCount) {
        _throw(Status.BadRequest, "人数已满")
      }
      if (order.uid === state.userId) {
        _throw(Status.BadRequest, "自己不能接自己的单子")
      }
      const user = (await UserModel.findById(state.userId))!
      user.works?.addToSet(order.id) //把订单id加入到我的工作集合
      order.workers?.addToSet(state.userId)

      if (order.workers?.toObject().length === order.headCount) {
        order.status = '待确认'
      }

      user.messages?.addToSet(await MessageModel.create({
        content: `接单申请已提交！ 订单 ${order.title} id:${order.id}`,
        rid: order.id,
        type: 1,
        title: '提交申请'
      }))

      const owner = (await UserModel.findById(order.uid))! //找到雇主

      owner.messages?.addToSet(await MessageModel.create({ //给雇主发消息
        content: `用户${state.userId}申请接单, 订单 ${order.title} id:${order.id}`,
        rid: order.id,
        type: 2,
        title: '工人接单'
      }))

      await order.save()
      await user.save()
      await owner.save()
      response.body = {
        message: "接单成功"
      }
    }
  )
  .get(
    "/finished/:rid",//工人点击完成订单,
    SessionGuard,
    async ({ params, state, response, throw: _throw }) => {
      const order = await OrderModel.findById(params.rid)
      if (!order) return
      order.finishedWorkers?.addToSet(state.userId)
      if (order?.finishedWorkers?.toObject().length === order?.workers?.toObject().length) {
        const user = await UserModel.findById(order?.uid)
        user?.messages?.addToSet(await MessageModel.create({
          content: `订单 ${order?.title} 已完成！`,
          rid: order.id,
          type: 2,
          title: '订单完成'
        }))
        await user?.save()
      }
      order.status = '已完成'
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
      const order = await OrderModel.findById(params.rid).populate('workers')
      if (!order) return
      if (order?.status === '已完成') _throw(Status.BadRequest, "已完成的订单不能取消")
      const owner = await UserModel.findById(order?.uid)
      owner?.messages?.addToSet(await MessageModel.create({
        content: `订单 ${order?.title} 已取消！`,
        rid: order.id,
        type: 2,
        title: '订单取消'
      }))
      if (order.workers) {
        for (const worker of order.workers?.toObject()) {
          worker.messages.addToSet(await MessageModel.create({
            title: '订单取消',
            content: `订单${order.id}申请已同意，请于约定时间进行工作！`,
            type: 1,
            rid: order.id
          }))
          await worker.save()
        }
      }
      order.status = '已取消'
      await order?.save()
      await owner?.save()
      response.body = {
        message: "取消成功"
      }
    }
  )
  .get(
    "/cancel-order/:rid",
    SessionGuard,
    async ({ state, params, response }) => {
      const order = (await OrderModel.findById(params.rid))!
      order.workers?.remove(state.userId)
      const user = (await UserModel.findById(state.userId))!
      user.works?.remove(order.id)
      user.messages?.addToSet(await MessageModel.create({
        content: `您已取消接取 订单 ${order?.title}！`,
        rid: order.id,
        title: '取消接单',
        type: 1,
      }))
      const owner = (await UserModel.findById(order.uid))!
      owner.messages?.addToSet(await MessageModel.create({
        content: `工人${user.name} 取消了接单`,
        rid: order.id,
        title: '取消接单',
        type: 2,
      }))
      await user.save()
      await order.save()
      await owner.save()
      response.body = {
        message: "取消接单成功"
      }
    }
  )
  .get(
    "/workers/:rid", //获取订单中的所有工人
    async (ctx) => {
      const order = (await OrderModel.findById(ctx.params.rid).populate('workers').exec())!
      ctx.response.body = order.workers
    }
  )