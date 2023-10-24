import { InputType, Field } from "@nestjs/graphql";
const Joi = require("joi");

@InputType()
export class UpdateQuizInput {
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
  @Field()
  id: string;

  @Field()
  name: string;
}

export const updateQuizSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
});
