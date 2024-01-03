import { type ItemSource } from './item-source/item-source.abstract.js'
import { type PageQuery } from './page-query.type.js'

export abstract class PageItemsGetter<out Item> {
  constructor(protected readonly itemSource: ItemSource<Item>) {}

  abstract getPageItems(query: Required<PageQuery>): Promise<Array<Item | undefined>>
}
