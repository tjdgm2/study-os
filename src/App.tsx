import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import './App.css'
import TaskRow from './TaskRow'

type Task = {
  id: number
  title: string
  subject: string
  duration: number
  actualMinutes: number
  completed: boolean
}

type StudyRecord = {
  id: number
  date: string
  taskTitle: string
  subject: string
  actualSeconds: number
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'TOEIC単語を100語復習する',
    subject: 'TOEIC',
    duration: 30,
    actualMinutes: 0,
    completed: false,
  },
  {
    id: 2,
    title: '数学の問題集を5ページ進める',
    subject: '数学',
    duration: 60,
    actualMinutes: 0,
    completed: false,
  },
  {
    id: 3,
    title: 'Reactの基本を学ぶ',
    subject: 'プログラミング',
    duration: 60,
    actualMinutes: 0,
    completed: false,
  },
]

const STORAGE_KEY = 'study-os-tasks'
const RECORDS_STORAGE_KEY = 'study-os-records'
const TASK_DATE_STORAGE_KEY = 'study-os-task-date'

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

const formatTimer = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(
    seconds,
  ).padStart(2, '0')}`
}

function App() {

  const todayKey = new Date().toLocaleDateString('sv-SE')

  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY)
    const savedDate = localStorage.getItem(TASK_DATE_STORAGE_KEY)

    if (savedDate !== todayKey) {
      localStorage.setItem(TASK_DATE_STORAGE_KEY, todayKey)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
      return []
    }

    if (!savedTasks) {
      return initialTasks
    }

    try {
      return JSON.parse(savedTasks) as Task[]
    } catch {
      return initialTasks
    }
  })

  const [records, setRecords] = useState<StudyRecord[]>(() => {
    const savedRecords = localStorage.getItem(RECORDS_STORAGE_KEY)

    if (!savedRecords) {
      return []
    }

    try {
      return JSON.parse(savedRecords) as StudyRecord[]
    } catch {
      return []
    }
  })


  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskSubject, setNewTaskSubject] = useState('TOEIC')
  const [newTaskDuration, setNewTaskDuration] = useState(30)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [view, setView] = useState<'today' | 'records'>('today')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const calendarYear = calendarDate.getFullYear()
  const calendarMonth = calendarDate.getMonth()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)


  useEffect(() => {
    if (!isTimerRunning) {
      return
    }
    const timerId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => {
        return currentSeconds + 1
      })
    }, 1000)

    //タイマー停止時や画面を閉じるときにintervalを解除する
    return () => {
      window.clearInterval(timerId)
    }
  }, [isTimerRunning])



  const today = new Intl.DateTimeFormat('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date())

  const incompleteTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  const nextTask = incompleteTasks[0]
  const remainingTimerSeconds = nextTask
    ? Math.max(
      nextTask.duration * 60 - elapsedSeconds,
      0,
    )
    : 0

  useEffect(() => {
    if (remainingTimerSeconds <= 0) {
      setIsTimerRunning(false)
    }
  }, [remainingTimerSeconds])

  const remainingTasks = incompleteTasks.slice(1)

  const remainingMinutes = incompleteTasks.reduce(
    (sum, task) => sum + task.duration,
    0,
  )

  const completedMinutes = completedTasks.reduce(
    (sum, task) => sum + (task.actualMinutes ?? 0),
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
      actualMinutes: 0,
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


  const finishTimer = () => {
    if (!nextTask || elapsedSeconds === 0) {
      return
    }

    const recordedMinutes = Math.max(
      1,
      Math.round(elapsedSeconds / 60),
    )

    const newRecord: StudyRecord = {
      id: Date.now(),
      date: todayKey,
      taskTitle: nextTask.title,
      subject: nextTask.subject,
      actualSeconds: elapsedSeconds,
    }

    setRecords((currentRecords) => {
      const nextRecords = [...currentRecords, newRecord]

      localStorage.setItem(
        RECORDS_STORAGE_KEY,
        JSON.stringify(nextRecords),
      )

      return nextRecords
    })

    updateTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === nextTask.id
          ? {
            ...task,
            actualMinutes:
              (task.actualMinutes ?? 0) + recordedMinutes,
            completed: true,
          }
          : task,
      ),
    )

    setIsTimerRunning(false)
    setElapsedSeconds(0)
  }

  const dailyGoalMinutes = 180

  const progressPercent = Math.min(
    100,
    Math.round(
      (completedMinutes / dailyGoalMinutes) * 100,
    ),
  )

  const firstDayOfMonth = new Date(
    calendarYear,
    calendarMonth,
    1,
  ).getDay()

  const daysInMonth = new Date(
    calendarYear,
    calendarMonth + 1,
    0,
  ).getDate()

  const calendarDays = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => index + 1,
    ),
  ]

  const hasRecordOnDay = (day: number | null) => {
    if(day === null) {
      return false
    }

    const month = String(calendarMonth + 1).padStart(2,'0')
    const date = String(day).padStart(2,'0')
    const dateKey = `${calendarYear}-${month}-${date}`
    return records.some((record) => record.date === dateKey)
  }

  const getDateKey = (day: number) => {
    const month = String(calendarMonth + 1).padStart(2,'0')
    const date = String(day).padStart(2,'0')

    return `${calendarYear}-${month}-${date}`
  }

  const selectedRecords = selectedDate
    ? records.filter((record) => record.date === selectedDate)
    : []

  return (
    <div className="app">
      <header className="topbar">
        <p className="brand">Study OS</p>

        <nav className="top-navigation">
          <button
            type="button"
            className={view === 'today' ? 'active' : ''}
            onClick={() => setView('today')}
          >
            今日
          </button>

          <button
            type="button"
            className={view === 'records' ? 'active' : ''}
            onClick={() => setView('records')}
          >
            記録
          </button>
        </nav>

        <p className="today-date">{today}</p>
      </header>

      <main className="dashboard">
        {view === 'today' ? (
          <>
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

            <section className="progress-section">
              <div className="progress-heading">
                <span>今日の目標</span>
                <strong>
                  {completedMinutes}/{dailyGoalMinutes}分
                </strong>
              </div>
            </section>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

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
                    <p>
                      {Math.floor(remainingTimerSeconds / 3600)
                        .toString()
                        .padStart(2, '0')}
                      :
                      {Math.floor((remainingTimerSeconds % 3600) / 60)
                        .toString()
                        .padStart(2, '0')}
                      :
                      {(remainingTimerSeconds % 60)
                        .toString()
                        .padStart(2, '0')}
                    </p>

                  </div>

                  <div className="timer-buttons">
                    <button
                      className={
                        isTimerRunning ? 'pause-button' : 'start-button'
                      }
                      onClick={() => setIsTimerRunning((running) => !running)}>
                      {isTimerRunning ? '一時停止' : 'スタート'}
                    </button>
                    <button onClick={() => {
                      setElapsedSeconds(0)
                      setIsTimerRunning(false)
                    }}
                    >
                      リセット
                    </button>
                  </div>

                  <div className="next-task-actions">


                    <button
                      className="complete-button"
                      type="button"
                      onClick={finishTimer}
                    >
                      記録して終了
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
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                    />
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
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                    />
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
          </>
        ) : (
          <>
            <section className="records-preview">
              <h2>学習記録</h2>

              <div className="calendar">
                <h3>
                  {calendarYear}年{calendarMonth+1}月
                </h3>
              </div>

              <div className="calendar-weekdays">
                {['日','月','火','水','木','金','土'].map(
                  (day) => (
                    <span key={day}>{day}</span>
                  ),
                )}
              </div>

              <div className="calendar-grid">
                {calendarDays.map((day,index) => (
                  <button
                    className={`calendar-day ${
                      hasRecordOnDay(day) ? 'has-record' : ''
                    } ${
                      selectedDate === getDateKey(day)
                      ? 'selected'
                      : ''
                    }`}
                    key={`${day}-${index}`}
                    type="button"
                    disabled={day === null}
                    onClick={() => {
                      if(day !== null) {
                        setSelectedDate(getDateKey(day))
                      }
                    }}
                  >
                    {day}
                    {hasRecordOnDay(day) && (
                      <span className="record-dot" />
                    )}
                    </button>
                ))}
                </div>

              {selectedDate === null ? (
                <p>日付を選ぶと、その日の記録が表示されます。</p>
              ) : selectedRecords.length === 0 ? (
                <p>この日の記録はありません。</p>
              ) : (
                <div className="records-list">
                  {selectedRecords.map((record) => (
                    <div className="record-card" key={record.id}>
                      <div className="record-info">
                        <strong>{record.taskTitle}</strong>
                        <small>{record.date}・{record.subject}</small>
                      </div>

                      <span className="record-time"> 
                        {Math.round(record.actualSeconds / 60)}分
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App