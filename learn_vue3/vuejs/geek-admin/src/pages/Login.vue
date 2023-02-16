<template>
  <el-container>
    <el-form ref="formRef">
      <el-form-item label="用户名">
        <el-input type="text" v-model="username"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input type="password" v-model="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin">登录</el-button>
      </el-form-item>
    </el-form>
  </el-container>
</template>

<script setup>
import {ref} from 'vue';
import {useStore} from "vuex";
import {useRouter} from "vue-router";
const store = useStore();
const router = useRouter();

const formRef = ref(null);
const loading = ref(false);
const username = ref('');
const password = ref('');

function handleLogin() {
  formRef.value.validate(async valid => {
    if (valid) {
      loading.value = true;
      const res = await store.dispatch('login', {
        username: username.value,
        password: password.value
      });
      console.log('Login.vue', res.code);
      loading.value = false;
      if (res.code !== 20000) {
        message({
          message: '登录失败',
          type: 'error'
        });
        return;
      }
      await router.replace('/');
    } else {
      console.log('error submit!!');
      message({
        message: '输入信息有误',
        type: 'error'
      });
      return false;
    }
  })
}
</script>
