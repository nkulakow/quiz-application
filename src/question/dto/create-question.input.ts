import { InputType, Field } from "@nestjs/graphql";
import {
  CreateAnswerInput,
  createAnswerSchema,
} from "@ent/answer/dto/create-answer.input";
const Joi = require("joi");

@InputType()
export class CreateQuestionInput {
  constructor(
    question: string,
    singleAnswer: boolean,
    multipleAnswer: boolean,
    sorting: boolean,
    plainText: boolean,
    answers: CreateAnswerInput[],
    quizId?: string
  ) {
    this.question = question;
    this.singleAnswer = singleAnswer;
    this.multipleAnswer = multipleAnswer;
    this.sorting = sorting;
    this.plainText = plainText;
    this.answers = answers;
    this.quizId = quizId;
  }

  @Field()
  question: string;

  @Field({ nullable: true })
  singleAnswer: boolean;

  @Field({ nullable: true })
  multipleAnswer: boolean;

  @Field({ nullable: true })
  sorting: boolean;

  @Field({ nullable: true })
  plainText: boolean;

  @Field(() => [CreateAnswerInput])
  answers: CreateAnswerInput[];

  @Field({ nullable: true })
  quizId: string;
}

export const createQuestionSchema = Joi.object({
  question: Joi.string().required(),
  singleAnswer: Joi.boolean().allow(null),
  multipleAnswer: Joi.boolean().allow(null),
  sorting: Joi.boolean().allow(null),
  plainText: Joi.boolean().allow(null),
  answers: Joi.array().items(createAnswerSchema),
  quizId: Joi.string(),
});
