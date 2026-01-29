import { cancelEventName } from '../core/constants'
import { getPageState } from './pageState'

/** 设置定时器触发器，按照给定时间间隔触发 */
export function setupTimerEmitter(checkFn: () => void) {
  const { checkInterval } = getPageState()

  const intervalId = +setInterval(checkFn, checkInterval)

  window.addEventListener(
    cancelEventName,
    () => {
      clearInterval(intervalId)
    },
    { once: true }
  )
}
