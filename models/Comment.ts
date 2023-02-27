import { getModelForClass, prop } from "npm:@typegoose/typegoose@9.13.x";
import mongoose from "npm:mongoose@~6.7.2";


export class Comment {
  @prop()
  orderId!: string;

  @prop()
  content!: string;

  @prop()
  authorId!: string;

  @prop()
  atId!: string;
}
