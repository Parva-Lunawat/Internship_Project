// const form = document.getElementById("todo-form");
// console.log(form);
// console.log("hollllla");
// console.log(form)
// window.alert("vbeurtvique")

let todos = [];
let currentFilter = "All";
// Data Model
// add obj to todos list to display
function addTodos(head, text, priority) {
    todos.push({
        id: crypto.randomUUID(),
        textHeader: head,
        text: text,
        priority: priority,
        completed: false,
        createdAt: Date.now()
    });
    renderList();
}

// Data Fetcher
const list = document.getElementById("todo-list");
const form = document.getElementById("todo-form");
const header = document.getElementById("task-header-input");
const input = document.getElementById("task-input");
const priority = document.getElementById("priority");
const totalCount = document.getElementById("Total_count");
const activeCount = document.getElementById("Active_count");
const completedCount = document.getElementById("Completed_count");
const filterContainer = document.querySelector(".todo-filter");

function todoToggler(id) {
    todos = todos.map(todo =>
        todo.id === id ? {...todo, completed : !todo.completed} : todo
    );
    renderList();
}

function deleteTodo(id) {
    todos = todos.filter(todo =>
        todo.id !== id
    );
    renderList();
}

function renderList() {
    list.innerHTML = "";
    let currTotal = 0, currActive = 0, currComp = 0;

    todos.forEach(todo => {
        if (todo.completed) currComp++;
        else currActive++;
        currTotal++;
    });

    const filteredTodos = todos.filter(todo => {
        if (currentFilter === "Active") return !todo.completed;
        if (currentFilter === "Completed") return todo.completed;
        return true;
    });

    filteredTodos.forEach(todo => {
        const li = document.createElement("li");
        li.style.listStyleType="none";
        li.innerHTML = `
            <div class="todo-card" data-priority=${todo.priority}>
                <div class="todo-card-header">
                    <h3>${todo.textHeader}</h3>
                    <div class="circle"></div>
                </div>
                <p>${todo.text}</p>
                <div class="todo-card-header">
                    <label>
                    <input type="checkbox" ${todo.completed ? "checked" : ""}>
                        ${todo.completed ? "Completed" : "Mark complete"}
                    </label>
                    <button class="priority-showcase button delete-btn">Delete</button>
                </div>
            </div>
        `;
        li.querySelector("input[type='checkbox']").addEventListener("change", () => {
            todoToggler(todo.id);
        });
        li.querySelector(".delete-btn").addEventListener("click", () => {
            deleteTodo(todo.id);
        });
        list.append(li);
    });
    totalCount.innerText = `Total: ${currTotal}`;
    activeCount.innerText = `Active: ${currActive}`;
    completedCount.innerText = `Completed: ${currComp}`;
}

function updateUI(activeBtn) {
    document
        .querySelectorAll(".todo-filter-b")
        .forEach(btn => btn.classList.remove("active"));
    activeBtn.classList.add("active");
}

filterContainer.addEventListener("click", (e) => {
    if (!e.target.matches(".todo-filter-b")) return;
    currentFilter = e.target.dataset.filter;
    updateUI(e.target);
    renderList();
});

// function todo

console.log(list);
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const head = header.value;
    const text = input.value;
    const pVal = priority.value;
    if (!text.trim()) return;
    addTodos(head, text, pVal);
    header.value="";
    input.value="";
});
