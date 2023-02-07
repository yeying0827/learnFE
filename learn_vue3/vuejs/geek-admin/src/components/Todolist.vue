<template>
  <div>
    <input type="text" v-model="title" @keydown.enter="addTodo">
    <button v-if="active < all" @click="clear">清理</button>
    <div v-if="todos.length">
      <transition-group name="flip-list" tag="ul">
        <li v-for="(todo, i) in todos" :key="todo.title">
          <input type="checkbox" v-model="todo.done">
          <span :class="{done: todo.done}">{{todo.title}}</span>
          <span class="remove-btn" @click="removeTodo($event, i)">❎</span>
        </li>
      </transition-group>
    </div>
    <div v-else>暂无数据</div>
    <div>
      全选 <input type="checkbox" v-model="allDone">
      {{active}} / {{all}}
    </div>
  </div>
  <transition name="modal">
    <div class="info-wrapper" v-if="showModal">
      <div class="info">你啥也没输入！</div>
    </div>
  </transition>
  <span class="dustbin">🗑</span>
  <div class="animate-wrapper">
    <transition @before-enter="beforeEnter" @enter="enter" @after-enter="afterEnter">
      <div class="animate" v-show="animate.show">📋</div>
    </transition>
  </div>
</template>

<script setup>
import {ref, computed, reactive} from "vue";
import {useStorage} from "../utils/storage";


const animate = reactive({
  show: false,
  el: null
});

function beforeEnter(el) {
  let dom = animate.el;
  let rect = dom.getBoundingClientRect();
  let x = window.innerWidth - rect.x - 60;
  let y = rect.y - 10;
  el.style.transform = `translate(${-x}px, ${y}px)`;
}

function enter(el, done) {
  document.body.offsetHeight // 手动触发一次重绘，换成其他可以触发重绘的操作也可以；看起来没有副作用也不占内存空间
  el.style.transform = `translate(0,0)`;
  el.addEventListener('transitionend', done); // 必须监听transitionend事件，否则不会触发after-enter事件
}

function afterEnter(el) {
  animate.show = false;
  el.style.display = 'none';
}

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


  const showModal = ref(false);

  function addTodo() {
    if(!title.value) {
      showModal.value = true;
      setTimeout(() => {
        showModal.value = false;
      }, 1500);
      return;
    }
    todos.value.push({
      title: title.value,
      done: false
    });
    title.value = "";
  }

  function clear() {
    todos.value = todos.value.filter(todo => !todo.done);
  }

  function removeTodo(e, i) {
    animate.el = e.target;
    animate.show= true;
    // todos.value.splice(i, 1);
    setTimeout(()=>{ // 删除最后一个li元素的之后，li已经不在dom上了，不在dom上的元素的坐标就是（0，0）,用定时器执行是为了异步执行删除li，主线程先不删除li以便于图标可以正确定位，等主线程任务（给图标定位）执行完了，再回来删除li
      todos.value.splice(i, 1)
    },100)
  }
  return {title, todos, addTodo, all, active, clear, allDone, showModal, removeTodo};
}

let {title, todos, addTodo, all, active, clear, allDone, showModal, removeTodo} = useTodos();

</script>

<style>
.info-wrapper {
  position: fixed;
  top: 20px;
  width: 200px;
}

.info {
  padding: 20px;
  color: #fff;
  background: #d88986;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(-60px);
}

.flip-list-move {
  transition: transform .8s ease;
}
.flip-list-enter-active,
.flip-list-leave-active {
  transition: all 1s ease;
}
.flip-list-enter-from,
.flip-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.animate-wrapper .animate {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 100;
  transition: all .5s linear;
}

.dustbin {
  position: fixed;
  top: 10px;
  right: 10px;
}
</style>
