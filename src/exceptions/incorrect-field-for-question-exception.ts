export class IncorrectFieldForQuestionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IncorrectFieldForQuestionException";
  }
}
