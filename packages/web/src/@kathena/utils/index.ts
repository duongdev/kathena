export const wait = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const getDevicePixelRatio = (): number => {
  if (!window) return 1
  return window.devicePixelRatio
}

export const isRetina = (): boolean => getDevicePixelRatio() > 1

export const repeatArray = (times: number) =>
  Array.from('.'.repeat(times)).map((_, idx) => idx)
