import { createStore } from 'vuex'

export default createStore({
  state: {
    status: '1' // 0-已完成 1-待办
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status
    }
  },
  actions: {
    setStatus({ commit }, status) {
      commit('SET_STATUS', status)
    }
  },
  getters: {
    status: state => state.status
  }
})
