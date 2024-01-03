import { type ListPaginated } from '@@shared/pagination/list-paginated.type.js'
import { createItemSource, type ItemSourceRaw, type ItemSource } from './item-source/create-item-source.js'
import { type PageQuery } from './page-query.type.js'
import { type PageItemsGetter } from './page-items-getter.abstract.js'
import { PageItemsGetterParallel } from './page-items-getter-parallel.js'
import { PageItemsGetterSequential } from './page-items-getter-sequential.js'
import { PageQueryValidator } from './page-query-validator.js'

interface PaginatedGeneratorParams {
  readonly defaultLimit?: number
  readonly defaultOffset?: number
  readonly disallowParallelItemSourceInvocation?: boolean
}

export class PaginatedGenerator<out Item> {
  public static readonly DEFAULT_DEFAULT_LIMIT = 10
  public static readonly DEFAULT_DEFAULT_OFFSET = 0

  protected readonly defaultLimit: number
  protected readonly defaultOffset: number
  protected readonly pageQueryValidator: PageQueryValidator
  protected readonly itemSource: ItemSource<Item>
  protected readonly pageItemsGetter: PageItemsGetter<Item>

  public readonly totalCount: number

  constructor(itemSourceRaw: ItemSourceRaw<Item>, {
    defaultLimit = new.target.DEFAULT_DEFAULT_LIMIT,
    defaultOffset = new.target.DEFAULT_DEFAULT_OFFSET,
    disallowParallelItemSourceInvocation = false,
  }: PaginatedGeneratorParams = {}) {
    this.defaultLimit = defaultLimit
    this.defaultOffset = defaultOffset
    this.pageQueryValidator = new PageQueryValidator({ defaultLimit, defaultOffset })
    this.itemSource = createItemSource(itemSourceRaw)

    if (disallowParallelItemSourceInvocation) {
      this.pageItemsGetter = new PageItemsGetterSequential(this.itemSource)
    } else {
      this.pageItemsGetter = new PageItemsGetterParallel(this.itemSource)
    }

    this.totalCount = this.itemSource.getTotalCount()
  }

  validatePageQuery(query: PageQuery): Required<PageQuery> {
    const queryValid = this.pageQueryValidator.validate(query)

    return queryValid
  }

  async getPage(query: PageQuery): Promise<ListPaginated<Item | undefined>> {
    const queryValid = this.validatePageQuery(query)
    const items = await this.pageItemsGetter.getPageItems(queryValid)

    return {
      items,
      pagination: {
        ...queryValid,
        totalCount: this.totalCount,
      },
    }
  }
}
