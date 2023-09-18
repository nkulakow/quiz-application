import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.answerRepository.findOne({where : {id: id},  relations: ["question"] });
  }

  update(updateAnswerInput: UpdateAnswerInput) {
    if (!this.findOne(updateAnswerInput.id)) {
      throw new NotFoundException(`Project with id ${updateAnswerInput.id} not found`);
    }
    let answerToUpdate = this.answerRepository.create(updateAnswerInput);
    return this.answerRepository.save(answerToUpdate);
  }

  remove(id: string) {
    return `This action removes a #${id} answer`;
  }
}
