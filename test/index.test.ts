import { it, describe, expect } from "vitest"
import { foo } from "../src"

describe('foo', () => {
  it('should return the input', () => {
    expect(foo(1)).toEqual(1)
  })
})