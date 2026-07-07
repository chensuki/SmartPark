// mockjs 最小类型声明（mockjs 没有自带类型定义）
declare module 'mockjs' {
  export interface MockOptions {
    url: string
    type?: string
    body?: string
  }
  export function mock(
    url: string | RegExp,
    method: string,
    fn: (options: MockOptions) => any,
  ): void
  const Mock: { mock: typeof mock }
  export default Mock
}
