import { beforeAll, describe, expect, test } from 'vitest'

import { defaultCheckUpgradeOptions } from '../../src/core/startCheckUpgrade'
import { cleanPageState, getPageState, setPageState } from '../../src/lib/pageState'

describe(`基础用法`, () => {
  beforeAll(() => void setPageState(defaultCheckUpgradeOptions))

  test(`初始值`, () => {
    expect(getPageState()).toEqual(defaultCheckUpgradeOptions)
  })

  test(`存值取值`, () => {
    expect(getPageState()).not.toHaveProperty('hash')
    setPageState({ hash: 'xxx' })
    expect(getPageState()).toHaveProperty('hash', 'xxx')
    expect(getPageState()).toHaveProperty('storageKey', defaultCheckUpgradeOptions['storageKey'])
  })

  test(`清理`, () => {
    cleanPageState()
    expect(getPageState()).toEqual({})
  })
})
