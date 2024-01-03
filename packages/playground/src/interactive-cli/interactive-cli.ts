import readline from 'readline'

export type Key = readline.Key

export abstract class InteractiveCLI {
  protected readlineInterface!: readline.Interface

  constructor(
    protected readonly input = process.stdin,
    protected readonly output = process.stdout,
  ) {
    this.input
      .setRawMode(true)
      .on('keypress', (input, key) => {
        this.onKeyPress(key, input)
      })
  }

  protected afterStart(): void | PromiseLike<void> {}

  protected abstract onKeyPress(key: Key, input: string): void

  async start(): Promise<void> {
    this.readlineInterface = readline.createInterface({
      input: this.input,
      output: this.output,
    })

    await this.afterStart()
  }
}
