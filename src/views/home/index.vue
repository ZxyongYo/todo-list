<template>
  <div class="container">
    <app-header />
    <todo-list />
    <app-footer />
  </div>
</template>

<script>
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TodoList from '@/components/TodoList'

export default {
  components: {
    AppHeader: Header,
    AppFooter: Footer,
    TodoList
  }
}
</script>

<style lang='scss' scoped>
.container{
  width: 375px;
  height: 100vh;
  overflow: hidden auto;
  background-color: $app-bg-color;
}
</style>
