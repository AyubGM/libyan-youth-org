import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function saveFile(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split('.').pop() || 'bin';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const filePath = join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  return `/uploads/${folder}/${fileName}`;
}

// Self-executing runner for local testing
async function testUpload() {
  try {
    const mockFile = new File(['Hello, world!'], 'hello.txt', { type: 'text/plain' });
    const resultPath = await saveFile(mockFile, 'test');
    console.log(`File saved successfully! Virtual Path: ${resultPath}`);
  } catch (err) {
    console.error('Upload test failed:', err);
  }
}

testUpload();