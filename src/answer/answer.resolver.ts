import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AnswerService } from './answer.service';
import { Answer } from './entities/answer.entity';
import { CreateAnswerInput } from './dto/create-answer.input';
import { UpdateAnswerInput } from './dto/update-answer.input';

@Resolver(() => Answer)
export class AnswerResolver {
  constructor(private readonly answerService: AnswerService) {}

  @Mutation(() => Answer)
  createAnswer(@Args('createAnswerInput') createAnswerInput: CreateAnswerInput) {
    return this.answerService.create(createAnswerInput);
  }

  @Mutation(() => Answer)
  updateAnswer(@Args('updateAnswerInput') updateAnswerInput: UpdateAnswerInput) {
    return this.answerService.update(updateAnswerInput);
  }

}
