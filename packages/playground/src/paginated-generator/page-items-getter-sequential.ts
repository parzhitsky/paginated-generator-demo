import { PageItemsGetter } from './page-items-getter.abstract.js'
import { type PageQuery } from './page-query.type.js';

export class PageItemsGetterSequential<out Item> extends PageItemsGetter<Item> {
  override async getPageItems({ offset, limit }: Required<PageQuery>): Promise<Array<Item | undefined>> {
    const items: Array<Item | undefined> = []

    for (let index = offset; index < limit + offset; index += 1) {
      const item = await this.itemSource.getItemByIndex(index)

      items.push(item)
    }

    return items
  }
}
