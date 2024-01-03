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

  validate(query: PageQuery): Required<PageQuery> {
    const limit = query.limit ?? this.defaultLimit

    if (limit < 1) {
      throw new PageQueryInvalidError('limit cannot be less than 1', limit)
    }

    if (limit % 1 !== 0) {
      throw new PageQueryInvalidError('limit must be an integer', limit)
    }

    const offset = query.offset ?? this.defaultOffset

    if (offset < 0) {
      throw new PageQueryInvalidError('offset cannot be less than 0', offset)
    }

    if (offset % 1 !== 0) {
      throw new PageQueryInvalidError('offset must be an integer', offset)
    }

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
