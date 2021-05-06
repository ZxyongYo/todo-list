<template>
  <header>
    <div class="title">Todo List</div>
  </header>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style lang='scss' scoped>
header{
  width: 375px;
  background-color: $primary-color;
  .title{
    color: #fff;
    font-size: 24px;
    height: 50px;
    text-align: center;
    line-height: 50px;
  }
}
</style>
