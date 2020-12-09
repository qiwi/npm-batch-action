export const mockOutput = (): void => {
  jest.spyOn(console, 'log')
    .mockImplementation(() => { /* noop */ })
  jest.spyOn(console, 'error')
    .mockImplementation(() => { /* noop */ })
}
