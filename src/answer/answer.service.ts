import { Injectable } from '@nestjs/common';
import { CreateAnswerInput } from './dto/create-answer.input';
import { UpdateAnswerInput } from './dto/update-answer.input';

@Injectable()
export class AnswerService {
  create(createAnswerInput: CreateAnswerInput) {
    return 'This action adds a new answer';
  }

  findAll() {
    return `This action returns all answer`;
  }

  findOne(id: string) {
    return `This action returns a #${id} answer`;
  }

  update(id: string, updateAnswerInput: UpdateAnswerInput) {
    return `This action updates a #${id} answer`;
  }

  remove(id: string) {
    return `This action removes a #${id} answer`;
  }
}
