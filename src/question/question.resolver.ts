import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from "@nestjs/graphql";
import { QuestionService } from "./question.service";
import { Question } from "./entities/question.entity";
import { CreateQuestionInput } from "./dto/create-question.input";
import { UpdateQuestionInput } from "./dto/update-question.input";
import { Answer } from "@src/answer/entities/answer.entity";
import { NotFoundException } from "@nestjs/common";

@Resolver(() => Question)
export class QuestionResolver {
  constructor(protected readonly questionService: QuestionService) {}

  @Mutation(() => Question, { name: "addQuestion" })
  createQuestion(
    @Args("addQuestionInput") createQuestionInput: CreateQuestionInput
  ) {
    let valueToReturn = this.questionService.create(createQuestionInput);
    return valueToReturn;
  }

  @Query(() => Question, { name: "getOneQuestion" })
  async findOne(@Args("id") id: string) {
    const question = await this.questionService.findOne(id);
    if (!question) {
      throw new NotFoundException("Question with given id not found");
    }
    return question;
  }

  @Mutation(() => Question)
  updateQuestion(
    @Args("updateQuestionInput") updateQuestionInput: UpdateQuestionInput
  ) {
    return this.questionService.update(updateQuestionInput);
  }

  @Mutation(() => Question)
  removeQuestion(@Args("id") id: string) {
    return this.questionService.remove(id);
  }

  @ResolveField(() => String, { nullable: true })
  type(@Parent() question: Question): string | null {
    if (question.singleAnswer) return "Single Answer";
    else if (question.multipleAnswer) return "Multiple Answer";
    else if (question.sorting) return "Sorting Question";
    else if (question.plainText) return "Plain Text Answer";
    else return null;
  }

  @ResolveField(() => [Answer], { nullable: true })
  possibleAnswers(@Parent() question: Question): Answer[] | null {
    if (question.plainText) return null;
    return question.answers;
  }
}
