import * as runner from '@qiwi/npm-batch-cli-api/target/es5/runner'

describe('cli', () => {
  it('gets data from stdin correctly ', () => {
    const stdin = process.openStdin()
    const runSpy = jest.spyOn(runner, 'run')
      .mockImplementation(() => Promise.resolve([]))
    const openStdinSpy = jest.spyOn(process, 'openStdin')
      .mockImplementation(() => stdin)
    const exitSpy = jest.spyOn(process, 'exit')
      .mockImplementation(() => undefined as never)

    require('../../main/ts')

    stdin.emit('data', 'a')
    stdin.emit('data', 'b')
    stdin.emit('data', 'c')
    stdin.emit('end')

    expect(runSpy).toHaveBeenCalledWith('abc')

    exitSpy.mockReset()
    openStdinSpy.mockReset()
    runSpy.mockReset()
  })
})
