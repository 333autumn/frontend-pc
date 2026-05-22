<template>
  <el-tag :type="color" size="small">{{ label }}</el-tag>
</template>

<script>
export default {
  name: 'StatusTag',
  props: {
    label: { type: String, default: '' },
    color: { type: String, default: 'info' }
  }
}
</script>
