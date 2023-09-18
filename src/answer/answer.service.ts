import { Injectable } from '@nestjs/common';
import { CreateAnswerInput } from './dto/create-answer.input';
import { UpdateAnswerInput } from './dto/update-answer.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './entities/answer.entity';

@Injectable()
export class AnswerService {
  constructor(@InjectRepository(Answer) private answerRepository: Repository<Answer>) {}
  
  create(createAnswerInput: CreateAnswerInput) {
    let answerToCreate = this.answerRepository.create(createAnswerInput);
    return this.answerRepository.save(answerToCreate);
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
