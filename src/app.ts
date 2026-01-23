import express from 'express';
import * as path from 'node:path';
import { z } from 'zod';
import { checkPassword } from './auth.service.ts';
import { TranscriptDB } from './transcript.service.ts';
import type { Transcript } from './types.ts';

export const app = express();
app.use(express.json());
const db = new TranscriptDB();

const zAddStudentBody = z.object({
  password: z.string(),
  studentName: z.string(),
});
app.post('/api/addStudent', (req, res) => {
  const body = zAddStudentBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).send({ error: 'Poorly-formed request' });
  } else if (!checkPassword(body.data.password)) {
    res.status(403).send({ error: 'Invalid credentials' });
  } else {
    const id = db.addStudent(body.data.studentName);
    res.send({ studentID: id });
  }
});

const zAddGradeBody = z.object({
  password: z.string(),
  studentID: z.int().gte(0),
  courseName: z.string(),
  courseGrade: z.number().gte(0).lte(100),
});
app.post('/api/addGrade', (req, res) => {
  try {
    const body = zAddGradeBody.parse(req.body);
    if (!checkPassword(body.password)) {
      res.status(403).send({ error: 'Invalid credentials' });
    } else {
      db.addGrade(body.studentID, body.courseName, body.courseGrade);
      res.send({ success: true });
    }
  } catch (e) {
    res.status(400).send({ error: 'Poorly-formed request' });
  }
});

const zGetTranscriptBody = z.object({
  password: z.string(),
  studentID: z.int().gte(0),
});
app.post('/api/getTranscript', (req, res) => {
  const body = zGetTranscriptBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).send({ error: 'Poorly-formed request' });
  } else if (!checkPassword(body.data.password)) {
    res.status(403).send({ error: 'Invalid credentials' });
  } else {
    let response: { success: true; transcript: Transcript } | { success: false };
    try {
      const transcript = db.getTranscript(body.data.studentID);
      response = { success: true, transcript };
    } catch {
      response = { success: false };
    }
    res.send(response);
  }
});

// This if-then-else check for MODE=production helps avoid a common source of
// pain:
//
// 1. You build the website (`npm run build`) and test it in production mode
// 2. You want to update the frontend, so you start the Vite development
//    server and edit code
// 3. You don't realize you have the *Express* server open in your browser,
//    serving stale files created during the build command in step #1.
//    You can't get any frontend changes to show up in the browser, no
//    matter what you do.
if (process.env.MODE === 'production') {
  // In production mode, we want to serve the frontend code from Express
  app.use(express.static(path.join(import.meta.dirname, '../frontend/dist')));
  app.get(/(.*)/, (req, res) =>
    res.sendFile(path.join(import.meta.dirname, '../frontend/dist/index.html')),
  );
} else {
  app.get('/', (req, res) => {
    res.send(
      'You are connecting directly to the API server in development mode! ' +
        'You probably want to look elsewhere for the Vite frontend.',
    );
    res.end();
  });
}
