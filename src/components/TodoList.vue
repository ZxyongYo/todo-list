<template>
  <div class="todo-list">
    <!-- 待办 -->
    <transition name="slide-right">
      <section v-show="status === '1'" ref="slide-todo-wrap" class="todo">
        <div v-for="item in todoList" :key="item.id" class="todo-item slide-item">
          <i class="iconfont icon-yuanxing" @click="handleDone(item.id, item.isComplete)" />
          <span>{{ item.content }}</span>
          <div class="btn-box">
            <div class="edit" @click="handleEdit(item.id, item.content)"><i class="iconfont icon-edit" /></div>
            <div class="delete" @click="handleDelete(item.id)"><i class="iconfont icon-delete" /></div>
          </div>
        </div>
        <div v-if="!todoList||todoList.length<=0" class="empty">还没有待办的事项</div>
        <div v-if="inputActive" class="insert-wrap">
          <div
            ref="insert-input"
            contenteditable="true"
            class="textarea"
            @focus="inputActive = true"
          />
          <div v-if="updateId" class="save-btn" @click="handleUpdate">保存</div>
          <div v-else class="save-btn" @click="handleSave">保存</div>
        </div>
        <div v-show="!inputActive" class="insert-btn" @click="handleInsertBtn" />
      </section>
    </transition>
    <!-- 已完成 -->
    <transition name="slide-left">
      <section v-show="status === '0'" ref="slide-done-wrap" class="done">
        <div v-for="item in doneList" :key="item.id" class="done-item slide-item">
          <i class="iconfont icon-wancheng1" @click="handleDone(item.id, item.isComplete)" />
          <span>{{ item.content }}</span>
          <div class="btn-box" style="z-index: -1">
            <div class="edit"><i class="iconfont icon-edit" /></div>
            <div class="delete"><i class="iconfont icon-delete" /></div>
          </div>
        </div>
        <div v-if="!doneList||doneList.length<=0" class="empty">还没有已完成的事项</div>
      </section>
    </transition>
    <div v-if="inputActive" class="mask" @click="inputActive = false" />
  </div>
</template>

<script>
import AV from '@/utils/leancloud'

export default {
  name: 'TodoList',
  data() {
    return {
      inputActive: false, // 输入框是否激活
      todoList: null, // 代办事项
      doneList: null, // 已完成事项
      updateId: '' // 要更新的id
    }
  },
  computed: {
    status() {
      return this.$store.getters.status
    }
  },
  watch: {
    status() {
      this.handleSlide()
    }
  },
  created() {
    this.getTodoList()
    this.$nextTick(() => {
      this.handleSlide()
    })
  },
  methods: {
    // 滑动
    handleSlide() {
      const el = this.status === '1' ? this.$refs['slide-todo-wrap'] : this.$refs['slide-done-wrap']
      let startX // 按下时的 pageX
      let currentX = 0 // 按时时的偏移量
      let diffX // 移动的距离
      // 按下
      el.addEventListener('touchstart', function(e) {
        const target = e.target.parentNode // 要移动的目标
        const slideItems = target.parentNode.querySelectorAll('.slide-item') // 所有能移动的元素
        // 遍历兄弟节点 全关闭
        slideItems.forEach(item => {
          if (item === target) return
          item.style.transform = 'translateX(0px)'
        })
        // 判断是不是目标元素
        if (target.className.indexOf('slide-item') === -1) return
        currentX = parseInt(target.style.transform.split('(')[1]) | 0
        target.style.transition = ''
        startX = e.changedTouches[0].pageX
      })
      // 按下 移动
      el.addEventListener('touchmove', function(e) {
        const target = e.target.parentNode
        // 判断是不是目标元素
        if (target.className.indexOf('slide-item') === -1) return
        diffX = startX - e.changedTouches[0].pageX // 移动的距离
        if (currentX) { // 如果已经打开了
          const moveX = currentX - diffX >= 0 ? 0 : currentX - diffX
          if (moveX < -120) return
          target.style.transform = `translateX(${moveX}px)`
        } else {
          const moveX = -diffX < -120 ? -120 : -diffX
          if (moveX > 0) return
          target.style.transform = `translateX(${moveX}px)`
        }
      })
      // 抬起
      el.addEventListener('touchend', function(e) {
        const target = e.target.parentNode
        // 判断是不是目标元素
        if (target.className.indexOf('slide-item') === -1) return
        // 移动距离超过60 直接打开
        if (diffX > 60) {
          target.style.transition = 'transform .3s'
          target.style.transform = 'translateX(-120px)'
        } else { // 移动距离小于60 自动合上
          target.style.transition = 'transform .3s'
          target.style.transform = 'translateX(0)'
        }
      })
    },
    // 编辑
    handleEdit(id, content) {
      this.inputActive = true
      this.updateId = id
      setTimeout(() => {
        this.$refs['insert-input'].innerText = content
        this.$refs['insert-input'].focus()
      }, 20)
    },
    // 删除
    handleDelete(id) {
      const todo = AV.Object.createWithoutData('todo', id)
      todo.destroy().then(() => {
        this.getTodoList()
        console.log('删除成功')
      }).catch(() => {
        alert('删除失败')
      })
    },
    // 从leancloud获取todoList
    getTodoList() {
      const query = new AV.Query('todo')
      query.find().then(res => {
        const todoList = []
        const doneList = []
        res.forEach(item => {
          const obj = {
            id: item.id,
            content: item.attributes.content,
            isComplete: item.attributes.isComplete
          }
          if (item.attributes.isComplete) {
            doneList.push(obj)
          } else {
            todoList.push(obj)
          }
        })
        this.todoList = todoList
        this.doneList = doneList
      }).catch(() => {
        alert('查询失败')
      })
    },
    // 向leancloud添加todo
    insertTodo(content) {
      // 声明 class
      const Todo = AV.Object.extend('todo')
      // 构建对象
      const todo = new Todo()
      // 为属性赋值
      todo.set('content', content) // todo内容
      todo.set('isComplete', false) // 已完成？
      // 将对象保存到云端
      todo.save().then(() => {
        this.getTodoList()
        console.log('保存成功')
      }).catch(() => {
        alert('新增失败')
      })
    },
    // 完成 待办中点icon移到已完成  已完成中点icon移到待办
    handleDone(id, isComplete) {
      const todo = AV.Object.createWithoutData('todo', id)
      todo.set('isComplete', !isComplete)
      todo.save().then(() => {
        this.getTodoList()
        console.log('更新成功')
      }).catch(() => {
        alert('更新失败')
      })
    },
    // 保存
    handleSave() {
      // 获取输入内容
      const content = this.$refs['insert-input'].innerText
      if (content == null || content.trim() === '') {
        return
      }
      this.insertTodo(content)
      // 清空输入框
      this.$refs['insert-input'].innerHTML = ''
      this.inputActive = false
    },
    // 更新
    handleUpdate() {
      const content = this.$refs['insert-input'].innerText
      if (content == null || content.trim() === '') {
        return
      }
      const todo = AV.Object.createWithoutData('todo', this.updateId)
      todo.set('content', content)
      todo.save().then(() => {
        this.inputActive = false
        this.getTodoList()
        console.log('更新成功')
      }).catch(() => {
        alert('更新失败')
      })
    },
    // 点击新增按钮
    handleInsertBtn() {
      this.inputActive = true
      this.updateId = ''
      setTimeout(() => {
        this.$refs['insert-input'].focus()
      }, 20)
    },
    // 去详情页
    toDetail(id, content) {
      this.$router.push({
        path: '/detail',
        query: { id, content }
      })
    }
  }
}
</script>

<style lang='scss' scoped>
.todo-list {
  font-size: 16px;
  min-height: calc(100vh - 50px - 60px);
  position: relative;
  .mask{
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba($color: #000, $alpha: .3);
    width: 100%;
    height: 100vh;
    z-index: 100;
  }
  section {
    width: 100%;
    min-height: calc(100vh - 50px - 60px);
    position: absolute;
    // padding-bottom: 70px;
    transition: all 0.3s ease;
    .todo-item,
    .done-item {
      position: relative;
      font-size: 20px;
      color: #333;
      width: 95%;
      height: 55px;
      line-height: 55px;
      box-sizing: border-box;
      padding-left: 50px;
      margin: 0 auto;
      margin-top: 10px;
      background-color: #fffffd;
      border-radius: 5px;
      box-shadow: 1px 1px 5px 0 #f3f3f3;
      >span{
        display: block;
        width: 100%;
        height: 100%;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
      }
      &:active{
        background-color: #f0f0f0;
      }
      >i.iconfont {
        position: absolute;
        font-size: 22px;
        color: #4f4f4d;
        display: block;
        width: 50px;
        text-align: center;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
      }
      .btn-box{
        position: absolute;
        right: -110px;
        top: 0;
        >div{
          display: inline-block;
          vertical-align: middle;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          text-align: center;
          line-height: 40px;
          &.edit{
            background-color: #01aaed;
            margin-right: 10px;
          }
          &.delete{
            background-color: #f92d2e;
          }
          &:active{
            opacity: .8;
          }
          i.iconfont{
            font-size: 24px;
            color: #fff;
          }
        }
      }
    }
    &.todo {
      .insert-wrap{
        position: fixed;
        z-index: 999;
        bottom: 0;
        width: 100%;
        box-sizing: border-box;
        padding-top: 15px;
        padding-bottom: 50px;
        background-color: #fff;
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
        .textarea{
          width: 88%;
          min-height: 40px;
          line-height: 20px;
          box-sizing: border-box;
          padding: 11px 10px 5px 10px;
          outline: none;
          caret-color: $primary-color; // 光标颜色
          font-size: 16px;
          color: #333;
          margin: 0 auto;
          border-radius: 20px;
          background-color: #e7e7e7;
        }
        .save-btn{
          position: absolute;
          right: 24px;
          bottom: 15px;
          color: #fff;
          font-size: 14px;
          background-color: $primary-color;
          height: 26px;
          line-height: 30px;
          box-sizing: border-box;
          border-radius: 13px;
          padding: 0 15px;
          :active{
            background-color: #0073ee;
          }
        }
      }
      .insert-btn{
        position: fixed;
        right: 25px;
        bottom: 85px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: $primary-color;
        box-shadow: 0 5px 10px 0px rgba($color: #037eff, $alpha: .3);
        &::before,
        &::after{
          content: "";
          display: block;
          width: 20px;
          height: 2px;
          border-radius: 1px;
          background-color: #fff;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(0);
        }
        &::after{
          transform: translate(-50%, -50%) rotate(90deg);
        }
        &:active{
          background-color: #0073ee;
        }
      }
      /** 进入 */
      &.slide-right-enter,
      &.slide-right-enter-active {
        transform: translateX(375px);
      }
      &.slide-right-enter-to {
        transform: translateX(0);
      }
      /** 离开 */
      &.slide-right-leave {
        transform: translateX(0);
      }
      &.slide-right-leave-active,
      &.slide-right-leave-to {
        transform: translateX(375px);
      }
    }
    &.done {
      .done-item{
        color: #888;
        i.iconfont{
          color: #888;
        }
      }
      /** 进入 */
      &.slide-left-enter,
      &.slide-left-enter-active {
        transform: translateX(-375px);
        .btn-box{
          opacity: 0;
        }
      }
      &.slide-left-enter-to {
        transform: translateX(0);
      }
      /** 离开 */
      &.slide-left-leave {
        transform: translateX(0);
        .btn-box{
          opacity: 0;
        }
      }
      &.slide-left-leave-active,
      &.slide-left-leave-to {
        transform: translateX(-375px);
        .btn-box{
          opacity: 0;
        }
      }
    }
    .empty{
      text-align: center;
      line-height: 80vh;
      font-size: 18px;
      color: #ccc;
    }
  }
}
</style>
