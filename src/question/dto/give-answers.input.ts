import { InputType, Field } from "@nestjs/graphql";
const Joi = require("joi");

@InputType()
export class GiveAnswerInput {
  constructor(questionId: string, answers: string[]) {
    this.questionId = questionId;
    this.answers = answers;
  }

  @Field()
  questionId: string;

  @Field(() => [String])
  answers: string[];
}

export const giveAnswerSchema = Joi.object({
  questionId: Joi.string().required(),
  answers: Joi.array().items(Joi.string()).required(),
});
