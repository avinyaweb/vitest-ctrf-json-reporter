import { describe, expect, it} from 'vitest'
import  GenerateCtrfReport from './generate-report'


describe('VitestGithubReporter', () => {
  it('should be defined', () => {
    expect(GenerateCtrfReport).toBeDefined()
  })
  it('example passing test', () => {
    expect(true).toBe(true)
  })
  it.skip('example skipped test', () => {
    expect(true).toBe(false)
  })
  it('example failing test', () => {
    expect(true).toBe(false)
  })
})

