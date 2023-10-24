import { InputType, Field } from "@nestjs/graphql";
import {
  UpdateAnswerInput,
  updateAnswerSchema,
} from "@ent/answer/dto/update-answer.input";
import {
  CreateAnswerInput,
  createAnswerSchema,
} from "@ent/answer/dto/create-answer.input";
const Joi = require("joi");

@InputType()
export class UpdateQuestionInput {
  constructor(
    id: string,
    question: string,
    singleAnswer: boolean,
    multipleAnswer: boolean,
    sorting: boolean,
    plainText: boolean,
    answers: UpdateAnswerInput[],
    newAnswers: CreateAnswerInput[],
    deleteAnswers: string[]
  ) {
    this.id = id;
    this.question = question;
    this.singleAnswer = singleAnswer;
    this.multipleAnswer = multipleAnswer;
    this.sorting = sorting;
    this.plainText = plainText;
    this.answers = answers;
    this.newAnswers = newAnswers;
    this.deleteAnswers = deleteAnswers;
  }

  @Field()
  id: string;

  @Field({ nullable: true })
  question: string;

  @Field({ nullable: true })
  singleAnswer: boolean;

  @Field({ nullable: true })
  multipleAnswer: boolean;

  @Field({ nullable: true })
  sorting: boolean;

  @Field({ nullable: true })
  plainText: boolean;

  @Field(() => [UpdateAnswerInput], { nullable: true })
  answers: UpdateAnswerInput[];

  @Field(() => [CreateAnswerInput], { nullable: true })
  newAnswers: CreateAnswerInput[];

  @Field(() => [String], { nullable: true })
  deleteAnswers: string[];
}

export const updateQuestionSchema = Joi.object({
  id: Joi.string().required(),
  question: Joi.string(),
  singleAnswer: Joi.boolean().allow(null),
  multipleAnswer: Joi.boolean().allow(null),
  sorting: Joi.boolean().allow(null),
  plainText: Joi.boolean().allow(null),
  answers: Joi.array().items(updateAnswerSchema).allow(null),
  newAnswers: Joi.array().items(createAnswerSchema).allow(null),
  deleteAnswers: Joi.array().items(Joi.string()).allow(null),
});
