import * as cliApi from '@qiwi/npm-batch-cli-api/target/es5/runner'

describe('cli', () => {
  it('calls readConfigAndRun and exits', async () => {
    const spy = jest.spyOn(cliApi, 'readConfigAndRun')
      .mockImplementation(() => Promise.resolve([]))
    const exitSpy = jest.spyOn(process, 'exit')
      .mockImplementation(() => undefined as never)
    const logSpy = jest.spyOn(console, 'log')
      .mockImplementation(() => { /* noop */ })
    // local script `jest` is called with --config=jest.config.json flag, and CLI script requires --config flag,
    // that's why now we don't need to add it to process.argv
    // process.argv.push('--config=config.json')

    require('../../main/ts')

    await expect(spy).toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalled()
    expect(exitSpy).toHaveBeenCalledWith(0)

    spy.mockReset()
    logSpy.mockReset()
    exitSpy.mockReset()
  })
})
