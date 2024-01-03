import readline from 'readline'

export type Key = readline.Key

export abstract class InteractiveCLI {
  protected readonly readlineInterface: readline.Interface

  constructor(
    protected readonly input: NodeJS.ReadStream = process.stdin,
    protected readonly output: NodeJS.WriteStream = process.stdout,
  ) {
    this.input.setRawMode(true).on('keypress', (input, key) => {
      this.onKeyPress(key, input)
    })

    this.readlineInterface = readline.createInterface({
      input: this.input,
      output: this.output,
    })

    this.readlineInterface.pause()
  }

  protected afterStart(): void | PromiseLike<void> {}

  protected abstract onKeyPress(key: Key, input: string): void

  async start(): Promise<void> {
    this.readlineInterface.resume()

    await this.afterStart()
  }
}
