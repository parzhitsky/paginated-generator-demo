import { PageItemsGetter } from './page-items-getter.abstract.js'
import { type PageQuery } from './page-query.type.js';

export class PageItemsGetterParallel<out Item> extends PageItemsGetter<Item> {
  override async getPageItems({ offset, limit }: Required<PageQuery>): Promise<Array<Item | undefined>> {
    const promises = Array.from({ length: limit }, (_, index) => this.itemSource.getItemByIndex(index + offset))
    const items = await Promise.all(promises)

    return items
  }
}
