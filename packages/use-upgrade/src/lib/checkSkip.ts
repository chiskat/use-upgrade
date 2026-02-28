import { getPageState } from './pageState'

/** 根据输入的 html 文件内容判断是否跳过本次提醒 */
export function checkSkip(htmlText: string): boolean {
  const { skipMetaName } = getPageState()

  if (!skipMetaName) {
    return false
  }

  const skipTagRegExp = new RegExp(`<meta[\\s\\S]+name=(?:['"]${skipMetaName}['"]|${skipMetaName}(?=[\\s/>]))`, 'g')
  const shouldSkip = skipTagRegExp.test(htmlText)

  return shouldSkip
}
