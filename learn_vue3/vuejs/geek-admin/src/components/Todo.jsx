import {defineComponent, ref} from "vue";

export default defineComponent({
    setup(props) {
        const title = ref('');
        const todos = ref([]);
        function addTodo() {
            todos.value.push({ title: title.value });
            title.value = '';
        }
        return () => <div>
            <input type="text" vModel={title.value}/>
            <button onClick={addTodo}>Click</button>
            <ul>
                {
                    todos.value.length ? todos.value.map(todo => <li>{todo.title}</li>) : <li>no data</li>
                }
            </ul>
        </div>
    }
})
