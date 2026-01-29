import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from './server'

beforeAll(() => void server.listen())
afterEach(() => void server.resetHandlers())
afterAll(() => void server.close())
