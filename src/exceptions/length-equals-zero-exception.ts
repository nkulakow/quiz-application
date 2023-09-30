export class LengthEqualsZeroException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LengthEqualsZeroException";
  }
}
