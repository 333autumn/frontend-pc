export default {
  namespaced: true,
  state: {
    sidebarCollapsed: false,
    breadcrumbs: [{ title: '首页', path: '/dashboard' }]
  },
  mutations: {
    TOGGLE_SIDEBAR(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    SET_BREADCRUMBS(state, items) {
      state.breadcrumbs = [{ title: '首页', path: '/dashboard' }, ...items]
    }
  },
  actions: {
    toggleSidebar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },
    setBreadcrumbs({ commit }, items) {
      commit('SET_BREADCRUMBS', items)
    }
  }
}
