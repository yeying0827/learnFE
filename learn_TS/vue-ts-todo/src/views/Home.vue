<template>
  <div class="home">
    <transition-group
      name="fade"
      tag="ul"
      class="list-group"
    >
      <TodoItem
        v-for="item in TodoListComputed"
        :key="item.id"
        @click-right="delHandle(item.id)"
        @click-left="doneHandle(item.id)"
        :id="item.id"
        :color="item.color"
        :name="item.name"
        :is-done="item.isDone"
        :icon-name="item.iconName"
        right-value="删除"
        left-value="完成"
      ></TodoItem>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {Mutation, State, Getter} from "vuex-class";
import TodoItem from "@/components/TodoItem.vue";
import {ITodoItem, Mode} from "@/store/state";

@Component({
  components: {
    TodoItem
  }
})
export default class Home extends Vue {
  @Mutation private deleteTodoItem!: (id: string) => void; // 类似写一个声明，关联到mutations中的操作
  @Mutation private doneTodoItem!: (id: string) => void;
  @Getter private getCurrentTodoList!: ITodoItem[];

  private get TodoListComputed() {
    const list = this.getCurrentTodoList.filter(item => !item.isDone);

    return list;
  }

  private delHandle(id: string) {
    this.deleteTodoItem(id);
  }

  private doneHandle(id: string) {
    this.doneTodoItem(id);
  }
}
</script>

<style lang="scss">
.home {
  width: 100%;
  height: calc(100vh - 7rem);
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
}
</style>
