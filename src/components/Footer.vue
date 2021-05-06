<template>
  <footer>
    <ul class="tab">
      <li class="tab-item" :class="{active: status==='0'}" @click="status='0'"><i class="iconfont icon-done" /> 已完成</li>
      <li class="tab-item" :class="{active: status==='1'}" @click="status='1'"><i class="iconfont icon-todo" /> 待办</li>
    </ul>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {

    }
  },
  computed: {
    status: {
      get() {
        return this.$store.getters.status
      },
      set(val) {
        this.$store.dispatch('setStatus', val)
      }
    }
  }
}
</script>
<style lang='scss' scoped>
footer {
  background-color: #f4f4f4;
  position: fixed;
  bottom: 0;
  .tab {
    width: 375px;
    height: 60px;
    display: flex;
    justify-content: space-around;
    flex-wrap: nowrap;
    .tab-item {
      color: #626262;
      font-size: 12px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      border-radius: 5px;
      transition: all .3s;
      &:active{
        background-color: #eee;
      }
      &.active{
        color: $primary-color;
      }
      i{
        font-size: 20px;
      }
    }
  }
}
</style>
