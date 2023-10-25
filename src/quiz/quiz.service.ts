import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateQuizInput, createQuizSchema } from "./dto/create-quiz.input";
import { UpdateQuizInput, updateQuizSchema } from "./dto/update-quiz.input";
import { InjectRepository } from "@nestjs/typeorm";
import { Quiz } from "./entities/quiz.entity";
import { Repository } from "typeorm";
import { QuestionService } from "@src/question/question.service";
import { Transactional } from "typeorm-transactional";
import { ValidationException } from "@src/exceptions/validation-exception";

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz) private quizRepository: Repository<Quiz>,
    private questionService: QuestionService
  ) {}

  @Transactional()
  async create(createQuizInput: CreateQuizInput) {
    const { error, value } = createQuizSchema.validate(createQuizInput);
    if (error) {
      throw new ValidationException(
        "Validation failed: " +
          error.details.map((detail) => detail.message).join(", ")
      );
    }
    let quizToCreate = this.quizRepository.create(createQuizInput);
    let createdQuiz = await this.quizRepository.save(quizToCreate);
    let quizId = createdQuiz.id;
    let questionsInput = createQuizInput.questions;
    createdQuiz.questions = [];
    for (let questionInput of questionsInput) {
      questionInput.quizId = quizId;
      let question = await this.questionService.create(questionInput);
      createdQuiz.questions.push(question);
    }
    return createdQuiz;
  }

  findAll() {
    return this.quizRepository.find({
      relations: ["questions", "questions.answers"],
    });
  }

  findOne(id: string) {
    return this.quizRepository.findOne({
      where: { id: id },
      relations: ["questions", "questions.answers"],
    });
  }

  @Transactional()
  async update(updateQuizInput: UpdateQuizInput) {
    const { error, value } = updateQuizSchema.validate(updateQuizInput);
    if (error) {
      throw new ValidationException(
        "Validation failed: " +
          error.details.map((detail) => detail.message).join(", ")
      );
    }

    if (!this.findOne(updateQuizInput.id)) {
      throw new NotFoundException(
        `Quiz with id ${updateQuizInput.id} not found`
      );
    }
    let quizToUpdate = this.quizRepository.create(updateQuizInput);
    return this.quizRepository.save(quizToUpdate);
  }

  @Transactional()
  async remove(id: string) {
    let quizToRemove = await this.findOne(id);
    if (!quizToRemove) {
      throw new NotFoundException(`Quiz with id ${id} not found`);
    }
    await this.quizRepository.remove(quizToRemove);
    quizToRemove.id = id;
    return quizToRemove;
  }
}
