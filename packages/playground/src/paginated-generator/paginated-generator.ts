import { type ListPaginated } from '@@shared/pagination/list-paginated.type.js'
import { type PageQuery } from './page-query.type.js'
import { PageQueryValidator } from './page-query-validator.js'

interface ItemSourceAlgorithm<out Item> {
  (this: unknown, index: number): Item | PromiseLike<Item>
}

interface ItemSourceStructure<out Item> {
  readonly [index: number]: Item
}

type ItemSource<Item> = ItemSourceAlgorithm<Item> | ItemSourceStructure<Item>

interface PaginatedGeneratorParams {
  readonly defaultLimit?: number
  readonly defaultOffset?: number
  /** Only has effect when item source is a function */
  readonly disallowParallelItemSourceInvocation?: boolean
}

export class PaginatedGenerator<out Item> {
  public static readonly DEFAULT_DEFAULT_LIMIT = 10
  public static readonly DEFAULT_DEFAULT_OFFSET = 0

  protected readonly defaultLimit: number
  protected readonly defaultOffset: number
  protected readonly disallowParallelItemSourceInvocation: boolean
  protected readonly pageQueryValidator: PageQueryValidator

  constructor(protected readonly itemSource: ItemSource<Item>, {
    defaultLimit = new.target.DEFAULT_DEFAULT_LIMIT,
    defaultOffset = new.target.DEFAULT_DEFAULT_OFFSET,
    disallowParallelItemSourceInvocation = false,
  }: PaginatedGeneratorParams = {}) {
    this.defaultLimit = defaultLimit
    this.defaultOffset = defaultOffset
    this.disallowParallelItemSourceInvocation = disallowParallelItemSourceInvocation
    this.pageQueryValidator = new PageQueryValidator({ defaultLimit, defaultOffset })
  }

  protected async getItemByIndex(index: number): Promise<Item | undefined> {
    let item: Item | undefined

    if (this.itemSource instanceof Function) {
      item = await this.itemSource(index)
    } else {
      item = this.itemSource[index]
    }

    return item
  }

  protected async getPageItemsParallel({ limit, offset }: Required<PageQuery>): Promise<Array<Item | undefined>> {
    const indexes = Array.from({ length: limit }, (_, index) => index + offset)
    const items = await Promise.all(indexes.map(this.getItemByIndex.bind(this)))

    return items
  }

  protected async getPageItemsSequential({ limit, offset }: Required<PageQuery>): Promise<Array<Item | undefined>> {
    const items: Array<Item | undefined> = []

    for (let index = offset; index < limit + offset; index += 1) {
      const item = await this.getItemByIndex(index)

      items.push(item)
    }

    return items
  }

  public validatePageQuery(query: PageQuery): Required<PageQuery> {
    const queryValid = this.pageQueryValidator.validate(query)

    return queryValid
  }

  async getPage(query: PageQuery): Promise<ListPaginated<Item | undefined>> {
    const queryValid = this.validatePageQuery(query)

    let items: Array<Item | undefined>

    if (this.disallowParallelItemSourceInvocation && this.itemSource instanceof Function) {
      items = await this.getPageItemsSequential(queryValid)
    } else {
      items = await this.getPageItemsParallel(queryValid)
    }

    return {
      items,
      pagination: {
        ...queryValid,
        totalCount: NaN, // there's no way to know that
      },
    }
  }
}
