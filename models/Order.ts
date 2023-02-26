import { getModelForClass, prop } from "typegoose";
import mongoose from "mongoose";


export class Order {
  @prop()
  uid!: string;

  @prop({ default: 0 })
  status!: number;

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
  price!: number;

  @prop()
  tip?: number; //小费

  @prop()
  phone!: string;

  @prop({ type: () => [String] })
  imgs?: string[];
}


export const OrderModel = getModelForClass(Order);