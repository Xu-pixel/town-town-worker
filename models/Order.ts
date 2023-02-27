import { getModelForClass, prop } from "npm:@typegoose/typegoose@9.13.x";
import mongoose from "npm:mongoose@~6.7.2";


export class Order {
  @prop()
  uid!: string;

  @prop({ default: '已发布' })
  status!: '已发布' | '待确认' | '进行中' | '已完成' | '已取消';

  @prop()
  title!: string; //需求标题

  @prop()
  requirements!: string; //事项描述

  @prop({ default: 1 })
  headCount!: number;

  @prop()
  preparations?: string;

  @prop()
  preparationPrice?: number;

  @prop()
  startTime!: number;

  @prop()
  workTime!: number;

  @prop()
  location!: string; //地址

  @prop()
  area!: string; //地区

  @prop()
  preparationsPrice!: number;

  @prop()
  tip?: number; //小费

  @prop()
  phone!: string;

  @prop({ type: () => [String] })
  imgs?: string[];

  @prop({ default: 0 })
  like?: number

  @prop({ default: 0 })
  dislike?: number

  @prop({ type: () => [String] })
  workers?: string[] //接单的工人的ID
}


export const OrderModel = getModelForClass(Order);