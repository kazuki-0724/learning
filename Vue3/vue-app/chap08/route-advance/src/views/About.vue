<template>
  <transition name="about" appear>
    <div class="about">
      <h1>This is an about page</h1>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'about'
}
</script>

<style>
.about-enter-active, .about-leave-active {
  transition: opacity 5s;
}

.about-enter, .about-leave-to {
  opacity: 0.0;
}
</style>