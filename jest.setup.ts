import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

if (typeof global.TextEncoder === 'undefined') {
  (global as any).TextEncoder = TextEncoder
}

if (typeof global.TextDecoder === 'undefined') {
  (global as any).TextDecoder = TextDecoder
}

const requestConstructor = typeof Request !== 'undefined' ? Request : undefined
const responseConstructor = typeof Response !== 'undefined' ? Response : undefined
const headersConstructor = typeof Headers !== 'undefined' ? Headers : undefined

if (requestConstructor && typeof (global as any).Request === 'undefined') {
  (global as any).Request = requestConstructor
}

if (responseConstructor && typeof (global as any).Response === 'undefined') {
  (global as any).Response = responseConstructor
}

if (headersConstructor && typeof (global as any).Headers === 'undefined') {
  (global as any).Headers = headersConstructor
}
