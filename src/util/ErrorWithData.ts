export class ErrorWithData<T> extends Error {
  constructor(message: string, public data: T) {
    super(message);
  }
}
