import { useState } from 'react'

type SettingsPageProps = {
    subjects: string[]
    setSubjects: React.Dispatch<React.SetStateAction<string[]>>
}

function SettingsPage({
    subjects,
    setSubjects,
}: SettingsPageProps) {

    const [newSubject, setNewSubject] = useState('')

    const addSubject = () => {
        const trimmedSubject = newSubject.trim()

        if (!trimmedSubject) {
            return
        }

        setSubjects((currentSubjects) => [
            ...currentSubjects,
            trimmedSubject,
        ])

        setNewSubject('')
    }


    return (
        <section className="settings-page">
            <h1>設定</h1>
            <p>学習ジャンルを管理します。</p>

            <div className="subject-add-form">
                <input
                    type="text"
                    value={newSubject}
                    onChange={(event) =>
                        setNewSubject(event.target.value)
                    }
                    placeholder="新しいジャンル"
                />

                <button
                    type="button"
                    onClick={addSubject}
                >
                    追加
                </button>
            </div>

            <div className="settings-subjects">
                {subjects.map((subject) => (
                    <div className="settings-subject-row" key={subject}>
                        {subject}
                    </div>
                ))}
            </div>

            

        </section>
    )
}

export default SettingsPage