<template>
  <div class="login-wrapper">
    <el-card class="login-card" shadow="always">
      <!-- Brand -->
      <div class="login-brand">
        <div class="brand-icon">
          <i class="el-icon-share"></i>
        </div>
        <div class="brand-title">消防器材管理系统</div>
        <div class="brand-subtitle">Fire Equipment Management System</div>
      </div>

      <!-- 登录面板 -->
      <el-form
        v-if="mode === 'login'"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="medium"
        @keyup.enter.native="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loginLoading"
            style="width: 100%"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
        <div class="login-footer">
          <a @click="switchMode('forgotPassword')">忘记密码</a>
          <a @click="switchMode('register')">注册账号</a>
        </div>
      </el-form>

      <!-- 注册面板 -->
      <el-form
        v-if="mode === 'register'"
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="login-form"
        size="medium"
      >
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" prefix-icon="el-icon-user" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请设置密码" prefix-icon="el-icon-lock" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码" prefix-icon="el-icon-lock" show-password />
        </el-form-item>
        <el-form-item prop="name">
          <el-input v-model="registerForm.name" placeholder="请输入真实姓名" prefix-icon="el-icon-edit-outline" />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" prefix-icon="el-icon-mobile-phone" />
        </el-form-item>
        <el-form-item prop="role">
          <el-select v-model="registerForm.role" placeholder="请选择用户类别" style="width: 100%">
            <el-option
              v-for="(item, key) in USER_ROLES"
              :key="key"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="department">
          <el-select v-model="registerForm.department" placeholder="请选择所属部门" style="width: 100%">
            <el-option v-for="d in DEPARTMENTS" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="registerLoading"
            style="width: 100%"
            @click="handleRegister"
          >
            注 册
          </el-button>
        </el-form-item>
        <div class="login-footer" style="justify-content: center">
          <a @click="switchMode('login')">返回登录</a>
        </div>
      </el-form>

      <!-- 忘记密码面板 -->
      <el-form
        v-if="mode === 'forgotPassword'"
        ref="forgotFormRef"
        :model="forgotForm"
        :rules="forgotRules"
        class="login-form"
        size="medium"
      >
        <el-form-item prop="phone">
          <el-input v-model="forgotForm.phone" placeholder="请输入注册手机号" prefix-icon="el-icon-mobile-phone" />
        </el-form-item>
        <el-form-item prop="smsCode">
          <div class="sms-row">
            <el-input v-model="forgotForm.smsCode" placeholder="请输入验证码" prefix-icon="el-icon-message" />
            <el-button
              class="sms-btn"
              :disabled="smsCountdown > 0"
              @click="handleSendSms"
            >
              {{ smsCountdown > 0 ? smsCountdown + 's' : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input v-model="forgotForm.newPassword" type="password" placeholder="请设置新密码" prefix-icon="el-icon-lock" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="forgotForm.confirmPassword" type="password" placeholder="请确认新密码" prefix-icon="el-icon-lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="forgotLoading"
            style="width: 100%"
            @click="handleForgotPassword"
          >
            重置密码
          </el-button>
        </el-form-item>
        <div class="login-footer" style="justify-content: center">
          <a @click="switchMode('login')">返回登录</a>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { USER_ROLES, DEPARTMENTS } from '@/utils/constants'
import { login, register, forgotPassword, sendSmsCode } from '@/api/user'

export default {
  name: 'Login',
  data() {
    const validateConfirmPassword = (rule, value, callback, target) => {
      if (value !== target) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    return {
      USER_ROLES,
      DEPARTMENTS,
      mode: 'login',
      loginLoading: false,
      registerLoading: false,
      forgotLoading: false,
      smsCountdown: 0,
      smsTimer: null,
      loginForm: {
        username: localStorage.getItem('remembered_username') || '',
        password: localStorage.getItem('remembered_password') || '',
        remember: !!localStorage.getItem('remembered_username')
      },
      registerForm: {
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        role: '巡检员',
        department: ''
      },
      forgotForm: {
        phone: '',
        smsCode: '',
        newPassword: '',
        confirmPassword: ''
      },
      loginRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      registerRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请设置密码', trigger: 'blur' }],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: (rule, value, callback) => validateConfirmPassword(rule, value, callback, this.registerForm.password), trigger: 'blur' }
        ],
        name: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ],
        role: [{ required: true, message: '请选择用户类别', trigger: 'change' }],
        department: [{ required: true, message: '请选择所属部门', trigger: 'change' }]
      },
      forgotRules: {
        phone: [
          { required: true, message: '请输入注册手机号', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ],
        smsCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
        newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: (rule, value, callback) => validateConfirmPassword(rule, value, callback, this.forgotForm.newPassword), trigger: 'blur' }
        ]
      }
    }
  },
  beforeDestroy() {
    if (this.smsTimer) clearInterval(this.smsTimer)
  },
  methods: {
    switchMode(mode) {
      this.mode = mode
      // Clear validation state when switching
      this.$nextTick(() => {
        const refMap = { login: 'loginFormRef', register: 'registerFormRef', forgotPassword: 'forgotFormRef' }
        const ref = this.$refs[refMap[mode]]
        if (ref) ref.clearValidate()
      })
    },
    handleLogin() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return
        this.loginLoading = true
        try {
          const res = await login({
            username: this.loginForm.username,
            password: this.loginForm.password
          })
          // Save token & user info to store
          this.$store.commit('user/SET_TOKEN', res.data.token)
          this.$store.commit('user/SET_USER_INFO', res.data.userInfo)
          // Remember password
          if (this.loginForm.remember) {
            localStorage.setItem('remembered_username', this.loginForm.username)
            localStorage.setItem('remembered_password', this.loginForm.password)
          } else {
            localStorage.removeItem('remembered_username')
            localStorage.removeItem('remembered_password')
          }
          this.$message.success('登录成功')
          this.$router.push('/dashboard')
        } catch (e) {
          this.$message.error(e.message || '登录失败')
        }
        this.loginLoading = false
      })
    },
    handleRegister() {
      this.$refs.registerFormRef.validate(async (valid) => {
        if (!valid) return
        this.registerLoading = true
        try {
          const payload = {
            username: this.registerForm.username,
            password: this.registerForm.password,
            name: this.registerForm.name,
            phone: this.registerForm.phone,
            role: this.registerForm.role,
            department: this.registerForm.department
          }
          await register(payload)
          this.$message.success('注册成功，请登录')
          this.registerForm = {
            username: '', password: '', confirmPassword: '',
            name: '', phone: '', role: '巡检员', department: ''
          }
          this.switchMode('login')
        } catch (e) {
          this.$message.error(e.message || '注册失败')
        }
        this.registerLoading = false
      })
    },
    handleSendSms() {
      // Validate phone before sending
      if (!/^1[3-9]\d{9}$/.test(this.forgotForm.phone)) {
        this.$message.warning('请先输入正确的手机号')
        return
      }
      sendSmsCode(this.forgotForm.phone).then(() => {
        this.$message.success('验证码已发送（演示码：888888）')
        this.smsCountdown = 60
        this.smsTimer = setInterval(() => {
          this.smsCountdown--
          if (this.smsCountdown <= 0) {
            clearInterval(this.smsTimer)
            this.smsTimer = null
          }
        }, 1000)
      }).catch(e => {
        this.$message.error(e.message || '发送失败')
      })
    },
    handleForgotPassword() {
      this.$refs.forgotFormRef.validate(async (valid) => {
        if (!valid) return
        this.forgotLoading = true
        try {
          await forgotPassword({
            phone: this.forgotForm.phone,
            smsCode: this.forgotForm.smsCode,
            newPassword: this.forgotForm.newPassword
          })
          this.$message.success('密码重置成功，请登录')
          this.forgotForm = { phone: '', smsCode: '', newPassword: '', confirmPassword: '' }
          this.switchMode('login')
        } catch (e) {
          this.$message.error(e.message || '重置失败')
        }
        this.forgotLoading = false
      })
    }
  }
}
</script>
