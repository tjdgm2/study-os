type Task = {
    id: number
    title: string
    subject: string
    duration: number
    actualMinutes: number
    completed: boolean
}

type TaskRowProps = {
    task: Task
    onToggle: (id: number) => void
    onDelete: (id: number) => void
}

function TaskRow({
    task,
    onToggle,
    onDelete,
}: TaskRowProps) {
    return (
        <article
            className={`task-row ${task.completed ? 'completed' : ''}`}
        >
            <button
                className="task-main"
                type="button"
                onClick={() => onToggle(task.id)}
            >
                <span
                    className={`checkbox ${task.completed ? 'checked' : ''}`}
                    >
                        {task.completed ? '✓' : ''}
                </span>

                <span className="task-copy">
                    <strong>{task.title}</strong>
                    <small>
                        {task.subject}・{task.duration}分
                        {task.completed && `・実績 ${task.actualMinutes}分`}
                    </small>
                </span>
            </button>
            <button
                className="delete-button"
                type="button"
                onClick={() => onDelete(task.id)}
                aria-label={`${task.title}を削除`}
            >
                ×
            </button>
        </article>
    )
}

export default TaskRow