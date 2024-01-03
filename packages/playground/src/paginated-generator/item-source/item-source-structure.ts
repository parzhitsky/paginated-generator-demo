import { ItemSource } from './item-source.abstract.js'

export interface IndexToItemMap<out Item> {
  readonly [index: number]: Item
}

export class ItemSourceStructure<out Item> extends ItemSource<Item> {
  constructor(protected readonly indexToItemMap: IndexToItemMap<Item>) {
    super()
  }

  getItemByIndex(index: number): Item | undefined {
    return this.indexToItemMap[index]
  }
}
