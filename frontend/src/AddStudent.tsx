import { useState } from "react";
import { addStudent } from "./service.ts";

interface AddStudentProps {
  visible: boolean;
}

export default function AddStudent({ visible }: AddStudentProps) {
  const [feedback, setFeedback] = useState<null | string>(null);
  const [name, setName] = useState<string>("");

  if (!visible) return null;
  return (
    <>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          try {
            const res = addStudent(name);
            setFeedback(`Record created for student '${name}' with ID ${res.studentID}`);
          } catch (err) {
            setFeedback(`${err}`);
          }
        }}
      >
        <label htmlFor="studentName">Enter new student's name:</label>
        <input
          id="studentName"
          value={name}
          onChange={(ev) => {
            setFeedback(null);
            setName(ev.target.value);
          }}
        />
        <br />
        <button>Create new student transcript</button>
      </form>
      <div className="feedback">{feedback}</div>
    </>
  );
}
