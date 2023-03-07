import { ModelOptions, prop, getModelForClass } from "npm:@typegoose/typegoose@9.13.x";
import type { Ref } from "npm:@typegoose/typegoose@9.13.x"

@ModelOptions({ schemaOptions: { timestamps: true } })
export class Message {
  @prop()
  rid!: string

  @prop()
  content!: string

  @prop({ default: 1 })
  type!: boolean

  @prop({ required: true })
  title!: string

  @prop({ default: false })
  isView!: boolean
}

export const MessageModel = getModelForClass(Message);
