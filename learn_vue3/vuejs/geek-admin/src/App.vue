<script setup>
import {ref} from 'vue';
import HelloWorld from './components/HelloWorld.vue';
import TheWelcome from './components/TheWelcome.vue';

// function fib(n) {
//   if (n <= 1) return 1;
//   else return fib(n-1) + fib(n-2);
// }
function fib(n) {
  let arr = [1, 1];
  let i = 2;
  while(i <= n) {
    arr[i] = arr[i - 1] + arr[i - 2];
    i ++;
  }
  return arr[n];
}
let count = ref(fib(38));
</script>

<template>
  <el-container>
    <el-header>
      <el-menu
      default-active="1"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b">
        <el-menu-item index="1">处理中心</el-menu-item>
        <el-submenu index="2">
          <template v-slot:title>我的工作台</template>
          <el-menu-item index="2-1">选项1</el-menu-item>
          <el-menu-item index="2-2">选项2</el-menu-item>
          <el-menu-item index="2-3">选项3</el-menu-item>
          <el-submenu index="2-4">
            <template v-slot:title>选项4</template>
            <el-menu-item index="2-4-1">选项1</el-menu-item>
            <el-menu-item index="2-4-2">选项2</el-menu-item>
            <el-menu-item index="2-4-3">选项3</el-menu-item>
          </el-submenu>
        </el-submenu>
        <el-menu-item index="3" disabled>消息中心</el-menu-item>
        <el-menu-item index="4">
          <a href="https://element3-ui.com" target="_blank">订单管理</a>
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <div>
          <router-link to="/">首页</router-link>
        </div>
        <div>
          <router-link to="/about">关于</router-link>
        </div>
        <div>
          <span>{{count}}</span>
        </div>
      </el-aside>
      <el-container>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
<!--  <router-view v-slot="{ Component, route }">
    <transition name="route" mode="out-in">
      <div :key="route.path" class="container">
        <component :is="Component"/>
      </div>
    </transition>
  </router-view>-->
</template>

<style>
.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
}

body > .el-container {
  margin-bottom: 40px;
}

.route-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.route-enter-active {
  transition: all .3s ease-out;
}
.route-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}
.route-leave-active {
  transition: all .3s ease-out;
}
</style>
