import { Resolver, Query, Args } from "@nestjs/graphql";
import { AnswerSubmitterService } from "./answer-submitter.service";
import { GetResultOutput } from "./dto/get-result.output";
import { GiveAnswerInput } from "@src/question/dto/give-answers.input";

@Resolver()
export class AnswerSubmitterResolver {
  constructor(
    private readonly answerSubmitterService: AnswerSubmitterService
  ) {}

  @Query(() => GetResultOutput, { name: "submitAnswers" })
  submitAnswers(
    @Args("id") id: string,
    @Args("givenAnswers", { type: () => [GiveAnswerInput] })
    givenAnswers: GiveAnswerInput[]
  ) {
    return this.answerSubmitterService.submitAnswers(id, givenAnswers);
  }
}
