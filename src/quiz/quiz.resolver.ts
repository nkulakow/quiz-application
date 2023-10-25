import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { QuizService } from "./quiz.service";
import { Quiz } from "./entities/quiz.entity";
import { CreateQuizInput } from "./dto/create-quiz.input";
import { UpdateQuizInput } from "./dto/update-quiz.input";

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
  findOne(@Args("id") id: string) {
    return this.quizService.findOne(id);
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
