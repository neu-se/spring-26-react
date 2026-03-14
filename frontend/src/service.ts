import { z } from "zod";

export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const zStudent = z.object({ studentID: z.int(), studentName: z.string() });
export type Student = z.infer<typeof zStudent>;
const zCourseGrade = z.object({ course: z.string(), grade: z.number() });
export type CourseGrade = z.infer<typeof zCourseGrade>;
const zTranscript = z.object({
  student: zStudent,
  grades: z.array(zCourseGrade),
});
export type Transcript = z.infer<typeof zTranscript>;
const zTranscriptStore = z.object({
  lastId: z.int().gte(0),
  transcripts: z.array(zTranscript),
});
type TranscriptStore = z.infer<typeof zTranscriptStore>;

/**
 * Calls a function that imperatively updates a transcript, and uses that
 * function to update the localstorage-stored transcript.
 */
function updateStoredTranscript<T>(update: (old: TranscriptStore) => T): T {
  const str = localStorage.getItem("transcripts") || `{"lastId":0,"transcripts": []}`;
  const transcript = zTranscriptStore.parse(JSON.parse(str));
  const returnValue = update(transcript);
  localStorage.setItem("transcripts", JSON.stringify(transcript));
  return returnValue;
}

/**
 * Returns the index of the transcript for a given student ID in the
 * transcript store. If this function returns successfully, the id can be
 * assumed to be a valid student ID.
 *
 * @param id - the id to look up
 * @returns the index of this transcript for this student ID in the `_transcripts` array
 * @throws if the there is no transcript with the given student ID
 */
function getIndexForId({ transcripts }: TranscriptStore, id: number): number {
  const index: number = transcripts.findIndex((t) => t.student.studentID === id);
  if (index === -1) {
    throw new ServiceError(`Transcript not found for student with ID ${id}`);
  }
  return index;
}

/**
 * Validate inputs and call the `addStudent` api
 *
 * @param password - credentials
 * @param studentName - a student name (error if empty)
 * @returns successful API response
 * @throws if validation fails or there is an API response error
 */
export function addStudent(studentName: string) {
  return updateStoredTranscript((transcriptStore) => {
    const studentID = transcriptStore.lastId + 1;
    transcriptStore.lastId = studentID;
    transcriptStore.transcripts.push({ student: { studentID, studentName }, grades: [] });
    return { studentID };
  });
}

/**
 * Validate inputs and call the `addGrade` api
 *
 * @param studentIDStr - student ID (error if not a positive integer)
 * @param courseName - student name
 * @param courseGradeStr - course grade (error if not a number between 0 and 100, inclusive)
 * @throws if validation fails or the student ID is invalid
 */
export function addGrade(studentIDStr: string, courseName: string, courseGradeStr: string) {
  const studentID = parseInt(studentIDStr);
  if (isNaN(studentID) || `${studentID}` !== studentIDStr || studentID < 0) {
    throw new ServiceError("Student ID is invalid");
  }

  const courseGrade = parseFloat(courseGradeStr);
  if (
    isNaN(courseGrade) ||
    `${courseGrade}` !== courseGradeStr ||
    courseGrade < 0 ||
    courseGrade > 100
  ) {
    throw new ServiceError("Course grade is not valid");
  }

  if (courseName === "") {
    throw new ServiceError("Course name is required");
  }

  return updateStoredTranscript((transcriptStore) => {
    const index = getIndexForId(transcriptStore, studentID);
    transcriptStore.transcripts[index].grades.push({ course: courseName, grade: courseGrade });
    return { success: true };
  });
}

/**
 * Validate inputs and call the `getTranscript` API
 *
 * @param studentIDStr - student ID (error if not a positive integer)
 * @throws if validation fails or the student ID is invalid
 */
export function getTranscript(
  studentIDStr: string,
): { success: false } | { success: true; transcript: Transcript } {
  const studentID = parseInt(studentIDStr);
  if (isNaN(studentID) || `${studentID}` !== studentIDStr || studentID < 0) {
    throw new ServiceError("Student ID is invalid");
  }

  return updateStoredTranscript((transcriptStore) => {
    try {
      const index = getIndexForId(transcriptStore, studentID);
      return { success: true, transcript: transcriptStore.transcripts[index] };
    } catch {
      return { success: false };
    }
  });
}
