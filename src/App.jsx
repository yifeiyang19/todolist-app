import React, { useState, useRef, useEffect } from 'react';
import Form from "./components/Form";
import FilterButton from "./components/FilterButton";
import Todo from "./components/Todo";
import { nanoid } from "nanoid";

const FILTER_MAP = {
  All: () => true,
  Active: (task) => !task.completed,
  Completed: (task) => task.completed,
};

const FILTER_NAMES = Object.keys(FILTER_MAP);

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    if (tasks) {
      setTasks(tasks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const sortedTasks = tasks.slice().sort((a, b) => {
      if (a.priority === "High" && b.priority !== "High") {
        return -1;
      } else if (a.priority !== "High" && b.priority === "High") {
        return 1;
      } else {
        return 0;
      }
    });
  
    // Check if sortedTasks is different from tasks before updating state
    if (!arraysAreEqual(sortedTasks, tasks)) {
      setTasks(sortedTasks);
    }
  }, [tasks]);
  
  // Helper function to compare two arrays
  function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }
  

  function toggleTaskCompleted(id) {
    const updatedTasks = tasks.map((task) => {
      if (id === task.id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
  }

  function deleteTask(id) {
    const remainingTasks = tasks.filter((task) => id !== task.id);
    setTasks(remainingTasks);
  }

  function editTask(id, newName, newPriority, newDeadline, newRepeat) {
    const editedTaskList = tasks.map((task) => {
      if (id === task.id) {
        return { ...task, name: newName, priority: newPriority, deadline: newDeadline, repeat: newRepeat };
      }
      return task;
    });
    setTasks(editedTaskList);
  }

  function addTask(name) {
    // Function to get user's current location
    function getUserLocation() {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              resolve({ latitude, longitude });
            },
            (error) => {
              reject(error.message);
            }
          );
        } else {
          reject("Geolocation is not supported by this browser.");
        }
      });
    }
  
    // Get user's location and add task with location information
    getUserLocation()
      .then((location) => {
        const newTask = { 
          id: "todo-" + nanoid(), 
          name: name, 
          completed: false, 
          priority: "Low", 
          deadline: null, 
          repeat: "None",
          location: location 
        };
        setTasks([...tasks, newTask]);
        localStorage.setItem('tasks', JSON.stringify([...tasks, newTask]));
      })
      .catch((error) => {
        console.error("Error getting user location:", error);
        // If there's an error getting location, add task without location information
        const newTask = { 
          id: "todo-" + nanoid(), 
          name: name, 
          completed: false, 
          priority: "Low", 
          deadline: null, 
          repeat: "None",
          location: null  // Set location to null if location cannot be retrieved
        };
        setTasks([...tasks]);
        localStorage.setItem('tasks', JSON.stringify([newTask]));
      });
  }  

  function addPhotoToTask(id, photo) {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, photo };
      }
      return task;
    });
    setTasks(updatedTasks);
  }

  const taskList = tasks
  ?.filter(FILTER_MAP[filter])
  .sort((a, b) => {
    const priorityOrder = { 'Low': 3, 'Medium': 2, 'High': 1 };
    // 如果优先级相同，则按照添加顺序排序
    if (a.priority === b.priority) {
      return 0;
    }
    // 如果a的优先级是High或者b的优先级不是High，则a排在前面
    else if (a.priority === 'High' || b.priority !== 'High') {
      return -1;
    }
    // 否则b排在前面
    else {
      return 1;
    }
  })
  .map((task) => (
    <Todo
      id={task.id}
      name={task.name}
      completed={task.completed}
      priority={task.priority}
      deadline={task.deadline}
      repeat={task.repeat}
      key={task.id}
      toggleTaskCompleted={toggleTaskCompleted}
      deleteTask={deleteTask}
      editTask={editTask}
      addPhotoToTask={addPhotoToTask}
    />
  ));

  const filterList = FILTER_NAMES.map((name) => (
    <FilterButton
      key={name}
      name={name}
      isPressed={name === filter}
      setFilter={setFilter}
    />
  ));

  return (
    <div className="todoapp stack-large">
      <h1>TodoMatic</h1>
      <Form addTask={addTask} />
      <div className="filters btn-group stack-exception">{filterList}</div>
      <h2 id="list-heading" tabIndex="-1">
        {taskList.length !== 1
          ? `${taskList.length} tasks remaining`
          : `${taskList.length} task remaining`}
      </h2>
      <ul
        aria-labelledby="list-heading"
        className="todo-list stack-large stack-exception"
        role="list"
      >
        {taskList}
      </ul>
    </div>
  );
}

export default App;