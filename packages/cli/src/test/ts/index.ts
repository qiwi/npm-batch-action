import * as cliApi from '@qiwi/npm-batch-cli-api/target/es5/runner'

describe('cli', () => {
  it('calls readConfigAndRun and exits', async () => {
    const spy = jest.spyOn(cliApi, 'readConfigAndRun')
      .mockImplementation(() => Promise.resolve())
    const exitSpy = jest.spyOn(process, 'exit')
      .mockImplementation(() => undefined as never)
    process.argv.push('--config=config.json')

    require('../../main/ts')

    await expect(spy).toHaveBeenCalled()
    expect(exitSpy).toHaveBeenCalledWith(0)

    spy.mockReset()
    exitSpy.mockReset()
  })
})
