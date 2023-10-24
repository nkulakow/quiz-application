import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateQuestionInput } from "./dto/create-question.input";
import {
  UpdateQuestionInput,
  updateQuestionSchema,
} from "./dto/update-question.input";
import { Question } from "./entities/question.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Answer } from "@src/answer/entities/answer.entity";
import { AnswerService } from "@src/answer/answer.service";
import { UpdateAnswerInput } from "@src/answer/dto/update-answer.input";
import { CreateAnswerInput } from "@src/answer/dto/create-answer.input";
import { Transactional } from "typeorm-transactional";
import { ValidationException } from "@src/exceptions/validation-exception";
import { createQuestionSchema } from "./dto/create-question.input";

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer) private answerRepository: Repository<Answer>,
    private AnswerService: AnswerService
  ) {}

  @Transactional()
  async create(createQuestionInput: CreateQuestionInput) {
    const { error, value } = createQuestionSchema.validate(createQuestionInput);
    if (error) {
      throw new ValidationException(
        "Validation failed: " +
          error.details.map((detail) => detail.message).join(", ")
      );
    }
    this.checkFieldsCorrespondsToQuestionType(createQuestionInput);

    let questionToCreate = this.questionRepository.create(createQuestionInput);
    let answersInput = createQuestionInput.answers;
    try {
      this.checkUniqnessOfTheAnswers(
        answersInput,
        [],
        questionToCreate.question
      );
    } catch (e) {
      e.message = `Error while creating answers: ${e.message}`;
      throw e;
    }
    let createdQuestion = await this.questionRepository.save(questionToCreate);
    let questionId = createdQuestion.id;
    createdQuestion.answers = [];
    await this.createAnswers(answersInput, questionId);
    return createdQuestion;
  }

  private async createAnswers(
    answersInput: CreateAnswerInput[],
    questionId: string
  ) {
    if (!answersInput) return;
    let question = await this.findOne(questionId);
    for (let answerInput of answersInput) {
      answerInput.questionId = questionId;
      question.answers.push(await this.AnswerService.create(answerInput));
    }
  }

  private checkUniqnessOfTheAnswers(
    answersInput: CreateAnswerInput[],
    savedAnswers: Answer[],
    question: string
  ) {
    if (!answersInput) return;
    const checkedAnswers = new Set();
    for (let answerInput of answersInput) {
      if (savedAnswers.find((answer) => answer.answer === answerInput.answer)) {
        throw new ValidationException(
          `Answer ${answerInput.answer} already exists for question ${question}`
        );
      }
      if (checkedAnswers.has(answerInput.answer)) {
        throw new ValidationException(
          `Gave ${answerInput.answer} 2 times for question ${question}`
        );
      }
      checkedAnswers.add(answerInput.answer);
    }
  }

  private checkFieldsCorrespondsToQuestionType(
    createQuestionInput: CreateQuestionInput
  ) {
    const typesBoleean = [
      createQuestionInput.singleAnswer,
      createQuestionInput.multipleAnswer,
      createQuestionInput.sorting,
      createQuestionInput.plainText,
    ];
    if (typesBoleean.filter(Boolean).length !== 1) {
      throw new ValidationException(
        `Only one type of question can be true for question: ${createQuestionInput.question}`
      );
    }
    for (let answer of createQuestionInput.answers) {
      if (createQuestionInput.sorting && !answer.number) {
        throw new ValidationException(
          `Field number is required for answer: ${answer.answer} for sorting question: ${createQuestionInput.question}`
        );
      }
      if (
        (createQuestionInput.singleAnswer ||
          createQuestionInput.multipleAnswer) &&
        answer.correct == null
      ) {
        throw new ValidationException(
          `Field correct is required for answer: ${answer.answer} for single/multiple answers question: ${createQuestionInput.question}`
        );
      }
    }
    if (
      createQuestionInput.plainText &&
      createQuestionInput.answers.length !== 1
    ) {
      throw new ValidationException(
        `Only one answer is allowed for plain text question: ${createQuestionInput.question}`
      );
    }
    if (
      createQuestionInput.singleAnswer &&
      createQuestionInput.answers.filter((answer) => answer.correct).length !==
        1
    ) {
      throw new ValidationException(
        `Only one correct answer is allowed for single answer question: ${createQuestionInput.question}`
      );
    }
  }

  findOne(id: string): Promise<Question> {
    return this.questionRepository.findOne({
      where: { id: id },
      relations: ["answers"],
    });
  }

  @Transactional()
  async update(updateQuestionInput: UpdateQuestionInput) {
    const { error, value } = updateQuestionSchema.validate(updateQuestionInput);
    if (error) {
      throw new ValidationException(
        "Validation failed: " +
          error.details.map((detail) => detail.message).join(", ")
      );
    }

    const question = await this.findOne(updateQuestionInput.id);
    if (!question) {
      throw new NotFoundException(
        `Question with id ${updateQuestionInput.id} not found`
      );
    }
    try {
      await this.updateAnswers(
        updateQuestionInput.answers,
        updateQuestionInput.id
      );
      await this.deleteAnswers(
        updateQuestionInput.deleteAnswers,
        updateQuestionInput.id
      );
      if (this.createAnswers) {
        this.checkUniqnessOfTheAnswers(
          updateQuestionInput.newAnswers,
          question.answers,
          question.question
        );
        await this.createAnswers(
          updateQuestionInput.newAnswers,
          updateQuestionInput.id
        );
      }
    } catch (e) {
      e.message = `Error while updating answers: ${e.message}`;
      throw e;
    }
    updateQuestionInput.answers = undefined;
    let questionToUpdate = this.questionRepository.create(updateQuestionInput);
    await this.questionRepository.save(questionToUpdate);
    return this.findOne(updateQuestionInput.id);
  }

  private async updateAnswers(
    updateAnswersInput: UpdateAnswerInput[],
    questionId: string
  ) {
    if (!updateAnswersInput) return;
    for (let answerInput of updateAnswersInput) {
      let updatedAnswer = await this.AnswerService.findOne(answerInput.id);
      if (updatedAnswer.questionId !== questionId) {
        throw new ValidationException(
          `Answer with ID ${answerInput.id} does not belong to question with ID ${questionId}`
        );
      }
    }
    for (let answerInput of updateAnswersInput) {
      await this.AnswerService.update(answerInput);
    }
  }

  private async deleteAnswers(
    deleteAnswersInput: string[],
    questionId: string
  ) {
    if (!deleteAnswersInput) return;
    let question = await this.findOne(questionId);
    for (let answerId of deleteAnswersInput) {
      if (!question.answers.find((answer) => answer.id === answerId)) {
        throw new ValidationException(
          `Answer with ID ${answerId} does not belong to question with ID ${questionId}`
        );
      }
    }
    for (let answerId of deleteAnswersInput) {
      await this.answerRepository.remove([
        question.answers.find((answer) => answer.id === answerId),
      ]);
    }
  }

  @Transactional()
  async remove(id: string) {
    let questionToRemove = await this.findOne(id);
    if (!questionToRemove) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    await this.questionRepository.remove(questionToRemove);
    questionToRemove.id = id;
    return questionToRemove;
  }
}
