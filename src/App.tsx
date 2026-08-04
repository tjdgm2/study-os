import { useState, type FormEvent } from 'react'
import './App.css'

type Task = {
  id: number
  title: string
  subject: string
  duration: number
  completed: boolean
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'TOEIC単語を100語復習する',
    subject: 'TOEIC',
    duration: 30,
    completed: false,
  },
  {
    id: 2,
    title: '数学の問題集を5ページ進める',
    subject: '数学',
    duration: 60,
    completed: false,
  },
  {
    id: 3,
    title: 'Reactの基本を学ぶ',
    subject: 'プログラミング',
    duration: 60,
    completed: false,
  },
]

const STORAGE_KEY = 'study-os-tasks'

const formatMinutes = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}分`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}時間`
  }

  return `${hours}時間${remainingMinutes}分`
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY)

    if (!savedTasks) {
      return initialTasks
    }

    try {
      return JSON.parse(savedTasks) as Task[]
    } catch {
      return initialTasks
    }
  })

  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskSubject, setNewTaskSubject] = useState('TOEIC')
  const [newTaskDuration, setNewTaskDuration] = useState(30)

  const today = new Intl.DateTimeFormat('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date())

  const incompleteTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  const nextTask = incompleteTasks[0]
  const remainingTasks = incompleteTasks.slice(1)

  const remainingMinutes = incompleteTasks.reduce(
    (sum, task) => sum + task.duration,
    0,
  )

  const completedMinutes = completedTasks.reduce(
    (sum, task) => sum + task.duration,
    0,
  )

  const updateTasks = (
    updater: (currentTasks: Task[]) => Task[],
  ) => {
    setTasks((currentTasks) => {
      const nextTasks = updater(currentTasks)

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nextTasks),
      )

      return nextTasks
    })
  }

  const toggleTask = (id: number) => {
    updateTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task,
      ),
    )
  }

  const deleteTask = (id: number) => {
    updateTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id),
    )
  }

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTitle = newTaskTitle.trim()

    if (!trimmedTitle) {
      return
    }

    const newTask: Task = {
      id: Date.now(),
      title: trimmedTitle,
      subject: newTaskSubject,
      duration: Math.max(5, newTaskDuration || 30),
      completed: false,
    }

    updateTasks((currentTasks) => [
      ...currentTasks,
      newTask,
    ])

    setNewTaskTitle('')
    setNewTaskDuration(30)
    setIsAdding(false)
  }

  return (
    <div className="app">
      <header className="topbar">
        <p className="brand">Study OS</p>
        <p className="today-date">{today}</p>
      </header>

      <main className="dashboard">
        <section className="page-header">
          <div>
            <p className="page-label">Today</p>
            <h1>今日やること</h1>
          </div>

          <p className="day-summary">
            {incompleteTasks.length}件・残り
            {formatMinutes(remainingMinutes)}
          </p>
        </section>

        {nextTask ? (
          <section className="next-section">
            <p className="section-label">次にやる</p>

            <article className="next-task">
              <div className="next-task-copy">
                <p className="task-meta">
                  {nextTask.subject}・
                  {formatMinutes(nextTask.duration)}
                </p>

                <h2>{nextTask.title}</h2>
              </div>

              <div className="next-task-actions">
                <button
                  className="complete-button"
                  type="button"
                  onClick={() => toggleTask(nextTask.id)}
                >
                  完了にする
                </button>

                <button
                  className="delete-button"
                  type="button"
                  onClick={() => deleteTask(nextTask.id)}
                  aria-label={`${nextTask.title}を削除`}
                >
                  ×
                </button>
              </div>
            </article>
          </section>
        ) : (
          <section className="empty-state">
            <p>今日のタスクは完了しました。</p>
            <span>おつかれさま。</span>
          </section>
        )}

        {remainingTasks.length > 0 && (
          <section className="remaining-section">
            <div className="section-heading">
              <h2>そのあと</h2>
              <span>{remainingTasks.length}件</span>
            </div>

            <div className="task-list">
              {remainingTasks.map((task) => (
                <article className="task-row" key={task.id}>
                  <button
                    className="task-main"
                    type="button"
                    onClick={() => toggleTask(task.id)}
                  >
                    <span className="checkbox" />

                    <span className="task-copy">
                      <strong>{task.title}</strong>
                      <small>
                        {task.subject}・
                        {formatMinutes(task.duration)}
                      </small>
                    </span>
                  </button>

                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`${task.title}を削除`}
                  >
                    ×
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="add-section">
          {!isAdding ? (
            <button
              className="add-toggle-button"
              type="button"
              onClick={() => setIsAdding(true)}
            >
              ＋ タスクを追加
            </button>
          ) : (
            <form className="task-form" onSubmit={addTask}>
              <input
                className="title-input"
                type="text"
                value={newTaskTitle}
                onChange={(event) =>
                  setNewTaskTitle(event.target.value)
                }
                placeholder="タスク名"
                autoFocus
              />

              <div className="form-row">
                <select
                  value={newTaskSubject}
                  onChange={(event) =>
                    setNewTaskSubject(event.target.value)
                  }
                  aria-label="科目"
                >
                  <option value="TOEIC">TOEIC</option>
                  <option value="数学">数学</option>
                  <option value="プログラミング">
                    プログラミング
                  </option>
                  <option value="その他">その他</option>
                </select>

                <label className="duration-field">
                  <input
                    type="number"
                    min="5"
                    max="300"
                    step="5"
                    value={newTaskDuration}
                    onChange={(event) =>
                      setNewTaskDuration(
                        Number(event.target.value),
                      )
                    }
                  />
                  <span>分</span>
                </label>
              </div>

              <div className="form-actions">
                <button
                  className="cancel-button"
                  type="button"
                  onClick={() => {
                    setIsAdding(false)
                    setNewTaskTitle('')
                  }}
                >
                  キャンセル
                </button>

                <button
                  className="save-button"
                  type="submit"
                >
                  追加
                </button>
              </div>
            </form>
          )}
        </section>

        {completedTasks.length > 0 && (
          <details className="completed-section">
            <summary>
              <span>完了済み</span>
              <span>{completedTasks.length}件</span>
            </summary>

            <div className="completed-list">
              {completedTasks.map((task) => (
                <article
                  className="task-row completed"
                  key={task.id}
                >
                  <button
                    className="task-main"
                    type="button"
                    onClick={() => toggleTask(task.id)}
                  >
                    <span className="checkbox checked">
                      ✓
                    </span>

                    <span className="task-copy">
                      <strong>{task.title}</strong>
                      <small>
                        {task.subject}・
                        {formatMinutes(task.duration)}
                      </small>
                    </span>
                  </button>

                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`${task.title}を削除`}
                  >
                    ×
                  </button>
                </article>
              ))}
            </div>
          </details>
        )}

        <footer className="daily-footer">
          <div>
            <span>完了</span>
            <strong>
              {completedTasks.length}/{tasks.length}
            </strong>
          </div>

          <div>
            <span>今日の学習時間</span>
            <strong>{formatMinutes(completedMinutes)}</strong>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App