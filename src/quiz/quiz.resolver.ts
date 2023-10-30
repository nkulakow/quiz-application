import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { QuizService } from "./quiz.service";
import { Quiz } from "./entities/quiz.entity";
import { CreateQuizInput } from "./dto/create-quiz.input";
import { UpdateQuizInput } from "./dto/update-quiz.input";
import { NotFoundException } from "@nestjs/common";
@Resolver(() => Quiz)
export class QuizResolver {
  constructor(private readonly quizService: QuizService) {}

  @Mutation(() => Quiz)
  createQuiz(@Args("createQuizInput") createQuizInput: CreateQuizInput) {
    return this.quizService.create(createQuizInput);
  }

  @Query(() => [Quiz], { name: "getAllQuizzes" })
  findAll() {
    return this.quizService.findAll();
  }

  @Query(() => Quiz, { name: "getOneQuiz" })
  async findOne(@Args("id") id: string) {
    const quiz = await this.quizService.findOne(id);
    if (!quiz) {
      throw new NotFoundException("Quiz with given id not found");
    }
    return quiz;
  }

  @Mutation(() => Quiz)
  updateQuiz(@Args("updateQuizInput") updateQuizInput: UpdateQuizInput) {
    return this.quizService.update(updateQuizInput);
  }

  @Mutation(() => Quiz)
  removeQuiz(@Args("id") id: string) {
    return this.quizService.remove(id);
  }
}
