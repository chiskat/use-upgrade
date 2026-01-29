/** 返回给定字符串的 Hash 结果 */
export function calcHash(input: string): string {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i)
  }

  const result = (hash >>> 0).toString(16)

  return result
}
