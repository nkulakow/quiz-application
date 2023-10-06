import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateQuestionInput } from "./dto/create-question.input";
import { UpdateQuestionInput } from "./dto/update-question.input";
import { Question } from "./entities/question.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Answer } from "@src/answer/entities/answer.entity";
import { AnswerService } from "@src/answer/answer.service";
import { UpdateAnswerInput } from "@src/answer/dto/update-answer.input";
import { GiveAnswerInput } from "./dto/give-answers.input";
import { ResultForQuestionOutput } from "./dto/result-for-question.output";
import { AnswerForResultOutput } from "@src/answer/dto/answer-for-result.output";
import { CreateAnswerInput } from "@src/answer/dto/create-answer.input";
import { LengthEqualsZeroException } from "@src/exceptions/length-equals-zero-exception";
import { DuplicateAnswerForQuestionException } from "@src/exceptions/duplicate-answer-for-question-exception";
import { AnswerDoesNotBelongToQuestionException } from "@src/exceptions/answer-does-not-belong-to-question-exception";
import { QuestionDoesNotBelongToQuizException } from "@src/exceptions/question-does-not-belong-to-quiz-exception";
import { IncorrectFieldForQuestionException } from "@src/exceptions/incorrect-field-for-question-exception";

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer) private answerRepository: Repository<Answer>,
    private AnswerService: AnswerService
  ) {}

  async create(createQuestionInput: CreateQuestionInput) {
    if (createQuestionInput.question.length < 1) {
      throw new LengthEqualsZeroException(`Question cannot be empty`);
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
        throw new DuplicateAnswerForQuestionException(
          `Answer ${answerInput.answer} already exists for question ${question}`
        );
      }
      if (checkedAnswers.has(answerInput.answer)) {
        throw new DuplicateAnswerForQuestionException(
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
      throw new IncorrectFieldForQuestionException(
        `Only one type of question can be true for question: ${createQuestionInput.question}`
      );
    }
    for (let answer of createQuestionInput.answers) {
      if (createQuestionInput.sorting && !answer.number) {
        throw new IncorrectFieldForQuestionException(
          `Field number is required for answer: ${answer.answer} for sorting question: ${createQuestionInput.question}`
        );
      }
      if (
        (createQuestionInput.singleAnswer ||
          createQuestionInput.multipleAnswer) &&
        answer.correct == null
      ) {
        throw new IncorrectFieldForQuestionException(
          `Field correct is required for answer: ${answer.answer} for single/multiple answers question: ${createQuestionInput.question}`
        );
      }
    }
    if (
      createQuestionInput.plainText &&
      createQuestionInput.answers.length !== 1
    ) {
      throw new IncorrectFieldForQuestionException(
        `Only one answer is allowed for plain text question: ${createQuestionInput.question}`
      );
    }
    if (
      createQuestionInput.singleAnswer &&
      createQuestionInput.answers.filter((answer) => answer.correct).length !==
        1
    ) {
      throw new IncorrectFieldForQuestionException(
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

  async update(updateQuestionInput: UpdateQuestionInput) {
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
        throw new AnswerDoesNotBelongToQuestionException(
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
        throw new AnswerDoesNotBelongToQuestionException(
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

  async remove(id: string) {
    let questionToRemove = await this.findOne(id);
    if (!questionToRemove) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    const answersToRemove = questionToRemove.answers;
    await this.answerRepository.remove(answersToRemove);
    await this.questionRepository.remove(questionToRemove);
    questionToRemove.id = id;
    return questionToRemove;
  }

  async checkAnswer(givenAnswer: GiveAnswerInput, quizId: string) {
    let question = await this.findOne(givenAnswer.questionId);
    if (!question) {
      throw new NotFoundException(
        `Question with id ${givenAnswer.questionId} not found`
      );
    }
    if (question.quizId !== quizId) {
      throw new QuestionDoesNotBelongToQuizException(
        `Question with id ${givenAnswer.questionId} does not belong to quiz with id ${quizId}`
      );
    }
    if (question.plainText) {
      return this.checkPlainTextAnswer(question, givenAnswer.answers[0]);
    }
    for (let answerId of givenAnswer.answers) {
      if (!question.answers.find((answer) => answer.id === answerId)) {
        throw new AnswerDoesNotBelongToQuestionException(
          `Answer with id ${answerId} does not belong to question with id ${givenAnswer.questionId}`
        );
      }
    }
    if (question.singleAnswer) {
      return this.checkSingleAnswer(question, givenAnswer.answers[0]);
    }
    if (question.multipleAnswer) {
      return this.checkMultipleAnswer(question, givenAnswer.answers);
    }
    if (question.sorting) {
      return this.checkSortingAnswer(question, givenAnswer.answers);
    }
  }

  private checkSingleAnswer(question: Question, answerId: string) {
    let correctAnswer = question.answers.find((answer) => answer.correct);
    let givenAnswers = [
      question.answers.find((answer) => answer.id === answerId).id,
    ];
    let scoreForQuestion = this.createResultForQuestionOutput(
      question,
      correctAnswer.id === answerId,
      [correctAnswer.id],
      givenAnswers
    );
    return scoreForQuestion;
  }

  private checkMultipleAnswer(question: Question, answerIds: string[]) {
    const correctAnswers = question.answers.filter((answer) => answer.correct);
    const correctAnswerIds = correctAnswers.map((answer) => answer.id);

    if (correctAnswerIds.length !== answerIds.length) {
      return this.createResultForQuestionOutput(
        question,
        false,
        correctAnswerIds,
        answerIds
      );
    }

    for (const answerId of answerIds) {
      if (!correctAnswerIds.includes(answerId)) {
        return this.createResultForQuestionOutput(
          question,
          false,
          correctAnswerIds,
          answerIds
        );
      }
    }

    return this.createResultForQuestionOutput(
      question,
      true,
      correctAnswerIds,
      answerIds
    );
  }

  private async checkSortingAnswer(question: Question, answerIds: string[]) {
    let Answers = question.answers.sort((a, b) => a.number - b.number);
    let isCorrect = true;
    for (let i = 0; i < Answers.length; i++) {
      if (Answers[i].id !== answerIds[i]) {
        isCorrect = false;
      }
    }
    let correctAnswerIds = Answers.map((answer) => answer.id);
    return this.createResultForQuestionOutput(
      question,
      isCorrect,
      correctAnswerIds,
      answerIds
    );
  }

  private async checkPlainTextAnswer(question: Question, answer: string) {
    let correctAnswer = question.answers[0].answer
      .toLowerCase()
      .trim()
      .replace(/ +/g, " ")
      .replace(/[.,-]/g, "");
    let trimmedAnswer = answer
      .toLowerCase()
      .trim()
      .replace(/ +/g, " ")
      .replace(/[.,-]/g, "");
    let scoreForQuestion = new ResultForQuestionOutput(
      question.id,
      question.question,
      true,
      correctAnswer === trimmedAnswer,
      [new AnswerForResultOutput(null, answer)],
      [new AnswerForResultOutput(null, question.answers[0].answer)]
    );
    return scoreForQuestion;
  }

  private async createResultForQuestionOutput(
    question: Question,
    correct: boolean,
    correctAnswersIds: string[],
    givenAnswersIds: string[]
  ) {
    let scoreForQuestion = new ResultForQuestionOutput(
      question.id,
      question.question,
      true,
      correct,
      [],
      []
    );
    scoreForQuestion.correctAnswers = await createCorrectAnswers();
    scoreForQuestion.givenAnswers = await createGivenAnswers();
    return scoreForQuestion;

    async function createCorrectAnswers(): Promise<AnswerForResultOutput[]> {
      let correctAnswers: AnswerForResultOutput[] = [];
      for (let correctAnswerId of correctAnswersIds) {
        let correctAnswer = question.answers.find(
          (answer) => answer.id === correctAnswerId
        );
        if (question.sorting) {
          correctAnswers.push(
            new AnswerForResultOutput(
              correctAnswer.id,
              correctAnswer.answer + " - " + correctAnswer.number
            )
          );
        } else {
          correctAnswers.push(
            new AnswerForResultOutput(correctAnswer.id, correctAnswer.answer)
          );
        }
        return correctAnswers;
      }
    }

    async function createGivenAnswers(): Promise<AnswerForResultOutput[]> {
      let givenAnswers = [];
      for (let index: number = 0; index < givenAnswersIds.length; index++) {
        let givenAnswer = question.answers.find(
          (answer) => answer.id === givenAnswersIds[index]
        );
        if (question.sorting) {
          givenAnswers.push(
            new AnswerForResultOutput(
              givenAnswer.id,
              givenAnswer.answer + " - " + (index + 1)
            )
          );
        } else {
          givenAnswers.push(
            new AnswerForResultOutput(givenAnswer.id, givenAnswer.answer)
          );
        }
      }
      return givenAnswers;
    }
  }

  getCorrectAnswers(question: Question): Answer[] {
    let correctAnswers: Answer[] = [];
    if (question.plainText) {
      return question.answers;
    }
    if (question.sorting) {
      correctAnswers = [
        ...question.answers.sort((a, b) => a.number - b.number),
      ];
      correctAnswers.forEach(
        (answer) => (answer.answer = answer.answer + " - " + answer.number)
      );
      return correctAnswers;
    }
    correctAnswers = question.answers.filter((answer) => answer.correct);
    return correctAnswers;
  }
}
