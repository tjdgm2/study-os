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
    const [editingSubject, setEditingSubject] = useState<string | null>(null)
    const [editingSubjectName, setEditingSubjectName] = useState('') 


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

    const saveEditedSubject = () => {
        const trimmedName = editingSubjectName.trim()

        if(!editingSubject || !trimmedName) {
            return 
        }

        setSubjects((currentSubjects) =>
            currentSubjects.map((subject) =>
                subject === editingSubject
                    ? trimmedName
                    : subject,
            ),
        )

        setEditingSubject(null)
        setEditingSubjectName('')
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
                        {editingSubject === subject ? (
                            <>
                                <input
                                    type="text"
                                    value={editingSubjectName}
                                    onChange={(event) =>
                                        setEditingSubjectName(event.target.value)
                                    }
                                />
                    <div className="subject-actions">
                                <button
                                    type="button"
                                    onClick={saveEditedSubject}
                                >   
                                    保存    
                                </button>
                            </div>
                            </>
                        ) : (
                            <>
                                <span>{subject}</span>
                    <div className="subject-actions">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingSubject(subject)
                                        setEditingSubjectName(subject)
                                    }}
                                >
                                    編集
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const shouldDelete = window.confirm(
                                            `${subject}を削除しますか？\n過去の学習記録は削除されません。`,
                                        )

                                        if(!shouldDelete){
                                            return
                                        }

                                        setSubjects((currentSubjects) =>
                                            currentSubjects.filter(
                                                (currentSubject) => currentSubject !== subject,
                                            ),
                                        )
                                    }}
                                >
                                    削除
                                </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            

        </section>
    )
}

export default SettingsPage