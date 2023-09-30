export class AnswerDoesNotBelongToQuestionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnswerDoesNotBelongToQuestionException";
  }
}
