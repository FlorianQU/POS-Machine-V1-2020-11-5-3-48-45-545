import { loadAllItems, loadPromotions } from './Dependencies'

export function printReceipt(tags: string[]): string {
  const allItems = loadAllItems()
  const promotions = loadPromotions()
  const itemList = tags.map(item => item.split('-')[0])
  const uniqueItemList = [...new Set(itemList)]
  const countList = generateCountList()
  const receipt = generateReceipt()
  return receipt

  function generateCountList(): number[]{
    const countList : number[] = new Array(uniqueItemList.length).fill(0)
    tags.forEach(item => {
      if (item.includes('-')) {
        const splitResult = item.split('-')
        countList[uniqueItemList.indexOf(splitResult[0])] += Number(splitResult[1])
      }
      else {
        countList[uniqueItemList.indexOf(item)] += 1
      }
    })
    return countList
  }


  function generateReceipt(): string{
    let output = ''
    output += '***<store earning no money>Receipt ***\n'
    let actualsum = 0
    let expectedsum = 0
    allItems.forEach(item => {
      const num = countList[uniqueItemList.indexOf(item.barcode)]
      if (num > 0) {
        output += `Name：${item.name}，`
        output += `Quantity：${num} ${item.unit === 'a' ? '' : item.unit}s，`
        output += `Unit：${item.price.toFixed(2)}(yuan)，`
        output += `Subtotal：${getPrice(item).toFixed(2)}(yuan)\n`
        actualsum += getPrice(item)
        expectedsum += Number((item.price * num).toFixed(2))
      }
    })
    const discount = expectedsum - actualsum
    output += '----------------------\n'
    output += `Total：${actualsum.toFixed(2)}(yuan)\n`
    if(discount > 0){
      output += `Discounted prices：${discount.toFixed(2)}(yuan)\n`
    }
    output += '**********************'
    return output
  }


  function getPrice(item: Item): number {

    const itemNum = countList[uniqueItemList.indexOf(item.barcode)]
    if (promotions[0].barcodes.includes(item.barcode)) {

      const actualNum = Math.floor(itemNum / 3) * 2 + itemNum % 3
      // console.log(actualNum)
      return item.price * actualNum
    }
    else return item.price * itemNum
  }

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
