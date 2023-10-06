export class DuplicateAnswerForQuestionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateAnswerForQuestionException";
  }
}
