import { shallowMount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg }
    })
    expect(wrapper.text()).toMatch(msg)

    const new_msg = 'こんにちは、Vue!!'
    wrapper.setProps({ msg: new_msg })
    expect(wrapper.find('h1').text()).toBe(new_msg)
   })
 })
