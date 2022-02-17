const todobtn = document.getElementById('todobtn')
const inprogressbtn = document.getElementById('inprogressbtn')
const donebtn = document.getElementById('donebtn')

const todo = document.querySelector('#todo .taskcontainer')
const inprogress = document.querySelector('#inprogress .taskcontainer')
const done = document.querySelector('#done .taskcontainer')
let newTasks = document.querySelectorAll('.newtask')

let draggables = document.querySelectorAll('.draggable')
const taskcontainers = document.querySelectorAll('.taskcontainer')
let taskId = 0;

(function () { //get tasks from localstorages
    let tasksFromLS = []
    Object.keys(localStorage).forEach(task => tasksFromLS.
        push(JSON.parse(localStorage.getItem(task))))

    if (localStorage.length > 0) {
        let ids = []
        tasksFromLS.forEach(task => ids.push(task.id))
        console.log(ids)
        taskId = Math.max.apply(Math, ids)
    }

    let todoTasks = []
    let inprogressTasks = []
    let doneTasks = []

    const tasksFromLSMapped = {
        todo: todoTasks,
        inprogress: inprogressTasks,
        done: doneTasks,
    }

    tasksFromLS.forEach(task => {
        if (task === null) {
            console.log('no tasks')
        } else if (task.col === 'todoTask') {
            todoTasks.push(task)
        } else if (task.col === 'inprogressTask') {
            inprogressTasks.push(task)
        } else if (task.col === 'doneTask') {
            doneTasks.push(task)
        }
    })


    todoTasks.sort((a, b) => sortTasks(a, b))
    inprogressTasks.sort((a, b) => sortTasks(a, b))
    doneTasks.sort((a, b) => sortTasks(a, b))

    function sortTasks(a, b) {
        if (a.order < b.order) {
            return -1
        }
    }

    tasksFromLSMapped.todo.forEach(task => todo.
        appendChild(createTextArea(task)))
    tasksFromLSMapped.inprogress.forEach(task => inprogress.
        appendChild(createTextArea(task)))
    tasksFromLSMapped.done.forEach(task => done.
        appendChild(createTextArea(task)))

    function createTextArea(task) {
        let textarea = document.createElement('textarea')
        textarea.classList.add('newtask', 'draggable', `${task.col}`)
        textarea.setAttribute('draggable', 'true')
        textarea.innerHTML += `${task.text}`
        textarea.id = task.id
        return textarea
    }
    renewTasksClasses()
})();

console.log(taskId)

todobtn.addEventListener('click', () => {
    newTask(todo)
    renewTasksClasses()
})

inprogressbtn.addEventListener('click', () => {
    newTask(inprogress)
    renewTasksClasses()
})

donebtn.addEventListener('click', () => {
    document.querySelectorAll('.doneTask.draggable').forEach(el => {
        el.remove()
        localStorage.removeItem(`Task${el.id}`)
    })
})

class Task {
    constructor(id, col, order, text) {
        this.id = id
        this.col = col
        this.order = order
        this.text = text
    }
}

function newTask(col) {
    let textarea = document.createElement('textarea')
    const currClass = col.classList[1]
    textarea.classList.add('newtask', 'draggable', `${currClass}`)
    textarea.setAttribute('draggable', 'true')
    textarea.innerHTML += ``
    textarea.id = ++taskId
    col.appendChild(textarea)
    textarea.focus()
}


function getCurrOrder(task, currClass) {
    const taskAllCol = document.querySelectorAll(`.draggable.${currClass}`)
    let taskOrder = 1
    for (let i = 0; taskAllCol[i].id !== task.id; i++) {
        taskOrder += 1
    }
    return taskOrder
}

function renewTasksClasses() {
    draggables = document.querySelectorAll('.draggable')
    newTasks = document.querySelectorAll('.newtask')
    newTasks.forEach((task) => {
        task.addEventListener('input', () => {
            const currClass = task.classList[2]
            const taskValue = task.value
            const taskOrder = getCurrOrder(task, currClass)
            const taskData = new Task(task.id, `${currClass}`, `${taskOrder}`, `${taskValue}`)
            console.log(taskData)
            localStorage.setItem(`Task${task.id}`, JSON.stringify(taskData))
        })

    })
    draggables.forEach((draggable) => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging')
        })
        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging')
        })
    })
}


taskcontainers.forEach((container) => { //dragover
    container.addEventListener('dragover', (e) => {
        e.preventDefault() //'e' is event in DOM
        const afterElement = getDragAfterElement(container, e.clientY)
        const draggable = document.querySelector('.dragging')
        draggable.classList.remove('todoTask', 'inprogressTask', 'doneTask')
        const currClass = container.classList[1] //get curr class
        if (afterElement == null) {
            container.appendChild(draggable)
            draggable.classList.add(`${currClass}`)
            defineTasksOrder(currClass)
        }
        else {
            container.insertBefore(draggable, afterElement)
            renewTasksClasses()
            draggable.classList.add(`${currClass}`)
            defineTasksOrder(currClass)
        }
    })
})

function defineTasksOrder(currClass) { //define tasks order and write them in LS
    const taskAllCol = document.querySelectorAll(`.draggable.${currClass}`)
    let taskOrder = 0
    for (let i = 0; i <= (taskAllCol.length - 1); i++) {
        taskOrder += 1
        const task = new Task(`${taskAllCol[i].id}`, `${currClass}`,
            `${taskOrder}`, `${taskAllCol[i].value}`)
        localStorage.setItem(`Task${taskAllCol[i].id}`, JSON.stringify(task))
    }
}

function getDragAfterElement(container, y) { //finds the position
    const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect() //returns size of element and his position
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        }
        else {
            return closest
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element
}
