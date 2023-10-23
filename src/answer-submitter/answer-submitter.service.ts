import { Injectable, NotFoundException } from "@nestjs/common";
import { Quiz } from "../quiz/entities/quiz.entity";
import { GiveAnswerInput } from "@src/question/dto/give-answers.input";
import { GetResultOutput } from "./dto/get-result.output";
import { ResultForQuestionOutput } from "@src/question/dto/result-for-question.output";
import { AnswerForResultOutput } from "@src/answer/dto/answer-for-result.output";
import { Question } from "@src/question/entities/question.entity";
import { QuestionService } from "@src/question/question.service";
import { QuizService } from "@src/quiz/quiz.service";
import { Answer } from "@src/answer/entities/answer.entity";
import { ValidationException } from "@src/exceptions/validation-exception";

@Injectable()
export class AnswerSubmitterService {
  constructor(
    private questionService: QuestionService,
    private quizService: QuizService
  ) {}
  async submitAnswers(id: string, givenAnswers: GiveAnswerInput[]) {
    let score = 0;
    let answeredQuestionsIds = [];
    let getResultOutput = new GetResultOutput(id, 0, []);
    let quiz = await this.quizService.findOne(id);
    if (!quiz) {
      throw new NotFoundException(`Quiz with id ${id} not found`);
    }

    for (let givenAnswer of givenAnswers) {
      const scoreForQuestion = await this.checkAnswer(givenAnswer, quiz.id);
      if (scoreForQuestion.correct) score++;
      getResultOutput.questions.push(scoreForQuestion);
      answeredQuestionsIds.push(givenAnswer.questionId);
    }
    getResultOutput.score = parseFloat(
      ((score * 100) / quiz.questions.length).toFixed(2)
    );

    for (let question of quiz.questions) {
      if (!answeredQuestionsIds.includes(question.id)) {
        const correctAnswers = this.getCorrectAnswers(question);
        const correctAnswersMapped = correctAnswers.map(
          (answer) => new AnswerForResultOutput(answer.id, answer.answer)
        );
        const scoreForQuestion = new ResultForQuestionOutput(
          question.id,
          question.question,
          false,
          false,
          [],
          correctAnswersMapped
        );

        getResultOutput.questions.push(scoreForQuestion);
      }
    }

    return getResultOutput;
  }

  async checkAnswer(givenAnswer: GiveAnswerInput, quizId: string) {
    let question = await this.questionService.findOne(givenAnswer.questionId);
    if (!question) {
      throw new NotFoundException(
        `Question with id ${givenAnswer.questionId} not found`
      );
    }
    if (question.quizId !== quizId) {
      throw new ValidationException(
        `Question with id ${givenAnswer.questionId} does not belong to quiz with id ${quizId}`
      );
    }
    if (question.plainText) {
      return this.checkPlainTextAnswer(question, givenAnswer.answers[0]);
    }
    for (let answerId of givenAnswer.answers) {
      if (!question.answers.find((answer) => answer.id === answerId)) {
        throw new ValidationException(
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
