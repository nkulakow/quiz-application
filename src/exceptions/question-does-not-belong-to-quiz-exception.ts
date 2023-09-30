export class QuestionDoesNotBelongToQuizException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuestionDoesNotBelongToQuizException";
  }
}
