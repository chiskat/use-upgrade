/**
 * 库 "useUpgrade" 的错误对象，通常用于 `instanceof` 判断
 *
 * @example
 * try {
 *   startCheckUpgrade(...)
 * } catch (e) {
 *   // 用法如下 ↓
 *   if (e instanceof UseUpgradeError) {
 *     // ...
 *   }
 * }
 */
export class UseUpgradeError extends Error {
  constructor(message: string) {
    super(message)

    this.name = 'UseUpgradeError'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UseUpgradeError)
    }
  }
}
