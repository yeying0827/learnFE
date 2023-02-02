<template>
  <div>
    <input type="text" v-model="title" @keydown.enter="addTodo">
    <button v-if="active < all" @click="clear">清理</button>
    <div v-if="todos.length">
      <ul>
        <li v-for="todo in todos">
          <input type="checkbox" v-model="todo.done">
          <span :class="{done: todo.done}">{{todo.title}}</span>
        </li>
      </ul>
    </div>
    <div v-else>暂无数据</div>
    <div>
      全选 <input type="checkbox" v-model="allDone">
      {{active}} / {{all}}
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from "vue";
import {useStorage} from "../utils/storage";

function useTodos() {
  let title = ref("");
  let todos = useStorage('todos');

  let active = computed(() => {
    return todos.value.filter(v => !v.done).length;
  });
  let all = computed(() => {
    return todos.value.length;
  });
  let allDone = computed({
    get: function() {
      return active.value === 0;
    },
    set: function (value) {
      todos.value.forEach(v => v.done = value);
    }
  })

  function addTodo() {
    todos.value.push({
      title: title.value,
      done: false
    });
    title.value = "";
  }

  function clear() {
    todos.value = todos.value.filter(todo => !todo.done);
  }
  return {title, todos, addTodo, all, active, clear, allDone};
}

let {title, todos, addTodo, all, active, clear, allDone} = useTodos();
</script>

<style>
/*h1  {
  color: red;
}*/
</style>
