'use client'

import { useState } from 'react'

interface Task {
    id: string
    title: string
    completed: boolean
}

export function TaskList() {
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', title: 'Welcome to your Next.js full-stack app!', completed: false },
        { id: '2', title: 'Customize your authentication providers', completed: false },
        { id: '3', title: 'Set up your database connection', completed: false },
        { id: '4', title: 'Build something amazing', completed: false },
    ])

    const [newTask, setNewTask] = useState('')

    const addTask = () => {
        if (newTask.trim()) {
            setTasks([...tasks, {
                id: Date.now().toString(),
                title: newTask,
                completed: false
            }])
            setNewTask('')
        }
    }

    const toggleTask = (id: string) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ))
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Tasks</h2>

            <div className="flex space-x-2">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Add a new task..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                    onClick={addTask}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    Add
                </button>
            </div>

            <div className="space-y-2">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-md"
                    >
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span
                            className={`flex-1 ${task.completed
                                    ? 'text-gray-500 line-through'
                                    : 'text-gray-900'
                                }`}
                        >
                            {task.title}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}