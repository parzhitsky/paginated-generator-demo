import { ItemSourceAlgorithm, type ItemByIndexGetter } from './item-source-algorithm.js'
import { ItemSourceStructure, type IndexToItemMap } from './item-source-structure.js'
import { type ItemSource } from './item-source.abstract.js'

export { type ItemSource } from './item-source.abstract.js'

export type ItemSourceRaw<Item> = IndexToItemMap<Item> | ItemByIndexGetter<Item>

export function createItemSource<Item>(raw: ItemSourceRaw<Item>): ItemSource<Item> {
  if (raw instanceof Function) {
    return new ItemSourceAlgorithm(raw)
  }

  return new ItemSourceStructure(raw)
}
