import { ItemSource } from './item-source.abstract.js'

export interface ItemByIndexGetter<out Item> {
  (this: unknown, index: number): PromiseLike<Item | undefined> | Item | undefined
}

export class ItemSourceAlgorithm<out Item> extends ItemSource<Item> {
  constructor(protected readonly doGetItemByIndex: ItemByIndexGetter<Item>) {
    super()
  }

  async getItemByIndex(index: number): Promise<Item | undefined> {
    const item = await this.doGetItemByIndex(index)

    return item
  }
}
