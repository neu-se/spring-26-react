import { useState } from "react";
import { getTranscript, type Transcript } from "./service.ts";

interface LookupTranscriptProps {
  visible: boolean;
}
export default function LookupTranscript({ visible }: LookupTranscriptProps) {
  const [feedback, setFeedback] = useState<
    null | { error: string } | { success: false } | { success: true; transcript: Transcript }
  >(null);
  const [studentID, setStudentID] = useState("");

  if (!visible) return null;
  return (
    <>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          try {
            const res = getTranscript(studentID);
            setFeedback(res);
          } catch (err) {
            setFeedback({ error: `${err}` });
          }
        }}
      >
        <label htmlFor="idToView">Enter student id to view:</label>
        <input
          id="idToView"
          value={studentID}
          onChange={(ev) => {
            setFeedback(null);
            setStudentID(ev.target.value);
          }}
        />
        <br />
        <button>View</button>
      </form>
      <div className="feedback">
        {feedback &&
          ("error" in feedback ? (
            `${feedback.error}`
          ) : !feedback.success ? (
            `No student exists with id ${studentID}`
          ) : (
            <>
              {`Transcript for student ${feedback.transcript.student.studentName} (id ${feedback.transcript.student.studentID})`}
              <ul>
                {feedback.transcript.grades.map(({ course, grade }, ndx) => (
                  <li key={ndx}>{`${grade} in ${course}`}</li>
                ))}
              </ul>
            </>
          ))}
      </div>
    </>
  );
}
