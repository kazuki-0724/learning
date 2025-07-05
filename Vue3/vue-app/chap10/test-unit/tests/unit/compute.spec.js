import MyCompute from '@/components/MyCompute.vue'

describe('MyCompute.vue', () => {
  it('Computed Test', () => {
    const that = { email: 'HOGE@example.com' }
    expect(MyCompute.computed.localEmail.call(that)).toBe('hoge')
  })
})