import { InputType, Field, Int } from "@nestjs/graphql";
const Joi = require("joi");

@InputType()
export class UpdateAnswerInput {
  constructor(
    id: string,
    answer: string,
    correct: boolean,
    number: number,
    questionId?: string
  ) {
    this.id = id;
    this.answer = answer;
    this.correct = correct;
    this.number = number;
    this.questionId = questionId;
  }

  @Field()
  id: string;

  @Field()
  answer: string;

  @Field({ nullable: true })
  correct: boolean;

  @Field(() => Int, { nullable: true })
  number: number;

  @Field({ nullable: true })
  questionId: string;
}

export const updateAnswerSchema = Joi.object({
  id: Joi.string().required(),
  answer: Joi.string().required(),
  correct: Joi.boolean().allow(null),
  number: Joi.number().allow(null),
  questionId: Joi.string(),
});
