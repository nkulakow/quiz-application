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

  @Query(() => [Answer], { name: 'answer' })
  findAll() {
    return this.answerService.findAll();
  }

  @Query(() => Answer, { name: 'answer' })
  findOne(@Args('id') id: string) {
    return this.answerService.findOne(id);
  }

  @Mutation(() => Answer)
  updateAnswer(@Args('updateAnswerInput') updateAnswerInput: UpdateAnswerInput) {
    return this.answerService.update(updateAnswerInput.id, updateAnswerInput);
  }

  @Mutation(() => Answer)
  removeAnswer(@Args('id') id: string) {
    return this.answerService.remove(id);
  }
}
