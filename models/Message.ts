import { ModelOptions, prop, getModelForClass } from "npm:@typegoose/typegoose@9.13.x";

@ModelOptions({ schemaOptions: { timestamps: true } })
export class Message {
  @prop()
  content!: string

  @prop({ default: false })
  isView!: boolean
}

export const MessageModel = getModelForClass(Message);
