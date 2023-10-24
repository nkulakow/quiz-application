import { InputType, Field } from "@nestjs/graphql";
import {
  CreateQuestionInput,
  createQuestionSchema,
} from "@ent/question/dto/create-question.input";
const Joi = require("joi");

@InputType()
export class CreateQuizInput {
  constructor(name: string, questions: CreateQuestionInput[]) {
    this.name = name;
    this.questions = questions;
  }

  @Field()
  name: string;

  @Field(() => [CreateQuestionInput])
  questions: CreateQuestionInput[];
}

export const createQuizSchema = Joi.object({
  name: Joi.string().required(),
  questions: Joi.array().items(createQuestionSchema),
});
