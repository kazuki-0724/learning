import { shallowMount, mount } from '@vue/test-utils'
import HelloStub from './HelloStub.vue'
import App from '@/App.vue'

describe('Mountの基本', () => {
  it('shallowMount vs mount', () => {
    let shallow = shallowMount(App)
    let deep = mount(App)
    console.log(shallow.html())
    console.log(deep.html())
  })

  it('Custom Stub', () => {
    let shallow = shallowMount(App, {
      stubs: {
        'HelloWorld': HelloStub
      }
      //'HelloWorld': true
    })
    console.log(shallow.html())
  })
})