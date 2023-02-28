import { ModelOptions, prop } from "npm:@typegoose/typegoose@9.13.x";

@ModelOptions({ schemaOptions: { timestamps: true } })
export class Comment {
  @prop()
  uid!: string;

  @prop()
  content?: string

  @prop()
  rate!: 0 | 1 | 2 // 0是差评 2是好评
}