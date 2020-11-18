import { loadAllItems, loadPromotions } from './Dependencies'

export function printReceipt(tags: string[]): string {
  const allItems = loadAllItems()
  const promotions = loadPromotions()

  const itemWithQuantity = countForItem(tags, allItems)
  const itemWithPriceInfo = generateItemsWithPriceInfo(itemWithQuantity, promotions)

  return generateReceipt(itemWithPriceInfo)
}

function decodeTagToItem(tags: string[], allItems: Item[]): Item[] {
  const uniqueItemList = [...new Set(tags.map(item => item.split('-')[0]))]
  // generate ordered itemWithCount Array, this is generated from allItems
  return allItems.filter(item => uniqueItemList.includes(item.barcode))
}

function countForItem(tags: string[], allItems: Item[]): ItemWithCount[] {
  const items: Item[] = decodeTagToItem(tags, allItems)
  const uniqueItemList = items.map(item => item.barcode)
  const countList: number[] = new Array(uniqueItemList.length).fill(0)
  tags.forEach(item => {
    if (item.includes('-')) {
      const splitResult = item.split('-')
      countList[uniqueItemList.indexOf(splitResult[0])] += Number(splitResult[1])
    }
    else {
      countList[uniqueItemList.indexOf(item)] += 1
    }
  })
  return items.map(item => {
    const num = countList[uniqueItemList.indexOf(item.barcode)]
    return new ItemWithCount(item, num)
  })
}

function generateItemsWithPriceInfo(itemWithQuantity: ItemWithCount[], promotions: any): ItemWithPriceInfo[] {
  return itemWithQuantity.map(
    item => {
      const num = item.num
      if (promotions[0].barcodes.includes(item.item.barcode)) {
        const actualNum = Math.floor(num / 3) * 2 + num % 3
        return new ItemWithPriceInfo(item, item.item.price * actualNum, item.item.price * Math.floor(num / 3))
      }
      else return new ItemWithPriceInfo(item, num * item.item.price, 0)
    }
  )
}
function generateReceipt(itemWithSum: ItemWithPriceInfo[]): string {
  return generateItemInReceipt(itemWithSum) + generateSumInReceipt(itemWithSum)
}
function generateItemInReceipt(itemWithSum: ItemWithPriceInfo[]): string {
  let output = ''
  output += '***<store earning no money>Receipt ***\n'
  output += itemWithSum.map(item => {
    return `Name：${item.item.name}，Quantity：${item.num} ${item.item.unit === 'a' ? '' : item.item.unit}s，Unit：${item.item.price.toFixed(2)}(yuan)，Subtotal：${item.sum.toFixed(2)}(yuan)\n`
  }).join('')
  return output
}
function generateSumInReceipt(itemWithSum: ItemWithPriceInfo[]): string {
  const sum = itemWithSum.reduce((acc, cur) => acc + cur.sum, 0)
  const discount = itemWithSum.reduce((acc, cur) => acc + cur.discount, 0)
  let output = '----------------------\n'
  output += `Total：${sum.toFixed(2)}(yuan)\n`
  if (discount > 0) {
    output += `Discounted prices：${discount.toFixed(2)}(yuan)\n`
  }
  output += '**********************'
  return output
}



class Item {
  barcode: string
  name: string
  unit: string
  price: number
  constructor(barcode: string, name: string, unit: string, price: number) {
    this.barcode = barcode
    this.name = name
    this.unit = unit
    this.price = price
  }
}

class ItemWithCount {
  item: Item
  num: number
  constructor(item: Item, num: number) {
    this.item = item
    this.num = num
  }
}

class ItemWithPriceInfo {
  item: Item
  num: number
  sum: number
  discount: number
  constructor(item: ItemWithCount, sum: number, discount: number) {
    this.item = item.item
    this.num = item.num
    this.sum = sum
    this.discount = discount
  }
}
