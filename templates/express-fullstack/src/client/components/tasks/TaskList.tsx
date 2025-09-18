import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'

interface Task {
    id: string
    title: string
    completed: boolean
    createdAt: string
}

export function TaskList() {
    const [newTask, setNewTask] = useState('')
    const queryClient = useQueryClient()

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => api.get('/tasks').then(res => res.data)
    })

    const createTaskMutation = useMutation({
        mutationFn: (title: string) => api.post('/tasks', { title }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            setNewTask('')
        }
    })

    const toggleTaskMutation = useMutation({
        mutationFn: ({ id, completed }: { id: string, completed: boolean }) =>
            api.patch(`/tasks/${id}`, { completed }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (newTask.trim()) {
            createTaskMutation.mutate(newTask)
        }
    }

    if (isLoading) {
        return <div className="text-center py-4">Loading tasks...</div>
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>

            <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    disabled={createTaskMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {createTaskMutation.isPending ? 'Adding...' : 'Add'}
                </button>
            </form>

            <div className="space-y-2">
                {tasks.map((task: Task) => (
                    <div
                        key={task.id}
                        className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-md shadow-sm"
                    >
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={(e) => toggleTaskMutation.mutate({
                                id: task.id,
                                completed: e.target.checked
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span
                            className={`flex-1 ${task.completed
                                    ? 'text-gray-500 line-through'
                                    : 'text-gray-900'
                                }`}
                        >
                            {task.title}
                        </span>
                        <span className="text-xs text-gray-400">
                            {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No tasks yet. Add one above to get started!
                    </div>
                )}
            </div>
        </div>
    )
}