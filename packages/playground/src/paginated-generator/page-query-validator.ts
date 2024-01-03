import { type PageQuery } from './page-query.type.js'

/** @private */
interface PageQueryValidatorParams {
  readonly defaultLimit: number
  readonly defaultOffset: number
}

/** @internal */
export class PageQueryValidator {
  protected readonly defaultLimit: number
  protected readonly defaultOffset: number

  constructor(params: PageQueryValidatorParams) {
    this.defaultLimit = params.defaultLimit
    this.defaultOffset = params.defaultOffset
  }

  protected validateLimit(limit: number | undefined): number {
    const limitValid = limit ?? this.defaultLimit

    if (limitValid < 1) {
      throw new PageQueryInvalidError('limit cannot be less than 1', limitValid)
    }

    if (limitValid % 1 !== 0) {
      throw new PageQueryInvalidError('limit must be an integer', limitValid)
    }

    return limitValid
  }

  protected validateOffset(offsetInput: number | undefined): number {
    const offset = offsetInput ?? this.defaultOffset

    if (offset < 0) {
      throw new PageQueryInvalidError('offset cannot be less than 0', offset)
    }

    if (offset % 1 !== 0) {
      throw new PageQueryInvalidError('offset must be an integer', offset)
    }

    return offset
  }

  validate(query: PageQuery): Required<PageQuery> {
    const limit = this.validateLimit(query.limit)
    const offset = this.validateOffset(query.offset)

    return {
      limit,
      offset,
    }
  }
}

export class PageQueryInvalidError<const out Key extends keyof PageQuery> extends Error {
  constructor(
    public readonly hint: `${Key} ${string}`,
    public readonly value: unknown,
  ) {
    super(`Invalid page query: ${hint}`)
  }
}
