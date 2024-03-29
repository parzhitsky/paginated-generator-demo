import { InteractiveCLI, type Key } from '@/interactive-cli/interactive-cli.js'
import { type PageQuery } from '@/paginated-generator/page-query.type.js'
import { PaginatedGenerator } from '@/paginated-generator/paginated-generator.js'

interface PaginatedGeneratorDemoParams {
  readonly pageSize: number
}

export class PaginatedGeneratorDemo<Item> extends InteractiveCLI {
  protected readonly outConsole = new console.Console(this.output)
  protected readonly maxOffset: number
  protected currentPageQuery: Required<PageQuery>

  constructor(protected readonly generator: PaginatedGenerator<Item>, { pageSize }: PaginatedGeneratorDemoParams) {
    super()

    this.currentPageQuery = {
      offset: 0,
      limit: pageSize,
    }

    const totalCount = this.generator.totalCount

    if (Number.isNaN(totalCount)) {
      this.maxOffset = Infinity
    } else {
      this.maxOffset = totalCount - (totalCount % pageSize)
    }
  }

  protected calcPrevPageQuery(): Required<PageQuery> {
    const { offset, limit } = this.currentPageQuery

    return {
      offset: Math.max(0, offset - limit),
      limit,
    }
  }

  protected calcNextPageQuery(): Required<PageQuery> {
    const { offset, limit } = this.currentPageQuery

    return {
      offset: Math.min(offset + limit, this.maxOffset),
      limit,
    }
  }

  protected async showCurrentPage(): Promise<void> {
    const page = await this.generator.getPage(this.currentPageQuery)

    this.outConsole.log(page.items)
    this.outConsole.log(page.pagination)
  }

  protected queryEqualsCurrent(query: PageQuery): boolean {
    const their = this.generator.validatePageQuery(query)
    const our = this.currentPageQuery

    return their.limit === our.limit && their.offset === our.offset
  }

  protected override async onKeyPress(key: Key): Promise<void> {
    let query: Required<PageQuery> | undefined

    if (key.name === 'left') {
      query = this.calcPrevPageQuery()
    } else if (key.name === 'right') {
      query = this.calcNextPageQuery()
    }

    if (query == null || this.queryEqualsCurrent(query)) {
      return
    }

    this.currentPageQuery = query

    await this.showCurrentPage()
  }

  protected override async afterStart(): Promise<void> {
    this.outConsole.log('Use ⬅️ and ➡️ arrows to change pages. Press Ctrl+C to exit.')

    await this.showCurrentPage()
  }
}
