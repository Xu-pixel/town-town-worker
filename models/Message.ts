import { ModelOptions, prop, getModelForClass } from "npm:@typegoose/typegoose@9.13.x";
import { Order } from './Order.ts'
import type { Ref } from "npm:@typegoose/typegoose@9.13.x"

@ModelOptions({ schemaOptions: { timestamps: true } })
export class Message {
  @prop({ ref: () => Order })
  rid: Ref<Order>;

  @prop()
  content!: string

  @prop({ default: false })
  isView!: boolean
}

export const MessageModel = getModelForClass(Message);
