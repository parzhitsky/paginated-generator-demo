export abstract class ItemSource<out Item> {
  abstract getItemByIndex(index: number): PromiseLike<Item | undefined> | Item | undefined
}
