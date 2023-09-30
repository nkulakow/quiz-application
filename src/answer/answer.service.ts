import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateAnswerInput } from "./dto/create-answer.input";
import { UpdateAnswerInput } from "./dto/update-answer.input";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Answer } from "./entities/answer.entity";
import { LengthEqualsZeroException } from "@src/exceptions/length-equals-zero-exception";

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer) private answerRepository: Repository<Answer>
  ) {}

  create(createAnswerInput: CreateAnswerInput) {
    if (createAnswerInput.answer.length < 1) {
      throw new LengthEqualsZeroException(`Answer cannot be empty`);
    }
    let answerToCreate = this.answerRepository.create(createAnswerInput);
    return this.answerRepository.save(answerToCreate);
  }

  findOne(id: string) {
    return this.answerRepository.findOne({
      where: { id: id },
      relations: ["question"],
    });
  }

  update(updateAnswerInput: UpdateAnswerInput) {
    if (!this.findOne(updateAnswerInput.id)) {
      throw new NotFoundException(
        `Answer with id ${updateAnswerInput.id} not found`
      );
    }
    let answerToUpdate = this.answerRepository.create(updateAnswerInput);
    return this.answerRepository.save(answerToUpdate);
  }
}
