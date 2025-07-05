import MyEmit from '@/components/MyEmit.vue'
import { shallowMount } from '@vue/test-utils'


it('$emit Test', () => {
  const wrapper = shallowMount(MyEmit)
  wrapper.find('input').trigger('click')
  const emit = wrapper.emitted()
  console.log(emit)

  expect(emit.update).toBeTruthy()
  expect(emit.update.length).toBe(2)
  expect(emit.update[1][0].version).toBe('2.6.10')
})