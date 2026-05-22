<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="logo">
        <span class="logo-icon">🧯</span>
        <span v-show="!sidebarCollapsed" class="logo-text">消防器材管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="sidebarCollapsed"
        :collapse-transition="false"
        background-color="#001529"
        text-color="#ffffffb3"
        active-text-color="#fff"
        router
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="'menu-' + item.path"
          :index="item.path"
        >
          <i :class="item.icon"></i>
          <span slot="title">{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- Header -->
    <div class="header-bar" :class="{ collapsed: sidebarCollapsed }">
      <div class="header-left">
        <i
          class="hamburger"
          :class="sidebarCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
          @click="toggleSidebar"
        ></i>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="item in breadcrumbs"
            :key="'bc-' + item.path"
            :to="{ path: item.path }"
          >{{ item.title }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-right">
        <el-badge :value="12" :max="99" class="notification-bell">
          <i class="el-icon-bell"></i>
        </el-badge>
        <el-dropdown trigger="click" @command="handleUserCommand">
          <span class="user-info">
            <span class="avatar">{{ userInfo.name ? userInfo.name.charAt(0) : '管' }}</span>
            <span class="username">{{ userInfo.name }} ({{ userInfo.role }})</span>
            <i class="el-icon-arrow-down"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item command="password">修改密码</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content" :class="{ collapsed: sidebarCollapsed }">
      <router-view :key="$route.path" />
    </div>
  </div>
</template>

<script>
import { menuItems } from '@/router/sidebar-menu'

export default {
  name: 'Layout',
  data() {
    return {
      menuItems,
      allRoutes: [
        { path: '/dashboard', title: '仪表盘' },
        { path: '/equipment', title: '器材管理' },
        { path: '/inspection', title: '巡检管理' },
        { path: '/hazard', title: '隐患管理' },
        { path: '/maintenance', title: '维保管理' },
        { path: '/warning', title: '预警管理' },
        { path: '/statistics', title: '统计报表' },
        { path: '/user', title: '用户管理' }
      ]
    }
  },
  computed: {
    sidebarCollapsed() {
      return this.$store.state.app.sidebarCollapsed
    },
    breadcrumbs() {
      return this.$store.state.app.breadcrumbs
    },
    userInfo() {
      return this.$store.state.user.userInfo
    },
    activeMenu() {
      const path = this.$route.path
      // Find the matching parent route
      for (const item of this.menuItems) {
        if (path.startsWith(item.path)) return item.path
      }
      return '/dashboard'
    }
  },
  watch: {
    '$route'(to) {
      this.updateBreadcrumb(to)
    }
  },
  created() {
    this.updateBreadcrumb(this.$route)
  },
  methods: {
    toggleSidebar() {
      this.$store.dispatch('app/toggleSidebar')
    },
    updateBreadcrumb(route) {
      const matched = route.matched || []
      const items = matched
        .filter(r => r.meta && r.meta.title)
        .map(r => ({ title: r.meta.title, path: r.path }))
      this.$store.dispatch('app/setBreadcrumbs', items)
    },
    handleUserCommand(command) {
      if (command === 'logout') {
        this.$confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$store.dispatch('user/logout')
          this.$message.success('已退出登录')
          this.$router.push('/login')
        }).catch(() => {})
      } else if (command === 'profile') {
        this.$message.info('功能开发中')
      } else if (command === 'password') {
        this.$message.info('功能开发中')
      }
    }
  }
}
</script>
