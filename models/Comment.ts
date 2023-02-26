import { getModelForClass, prop } from "typegoose";
import mongoose from "mongoose";

type id = string;

export class Comment {
  @prop()
  orderId!: id;

  @prop()
  content!: string;

  @prop()
  author!: id;

  @prop()
  at!: id;
}
