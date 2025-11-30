
import mammoth from 'mammoth';

// This function is designed to run on the server-side, where it can access the file system.
export async function extractTextFromFile(file: { path: string; mimetype: string }): Promise<string> {
    if (!file || !file.path || !file.mimetype) {
        throw new Error('Invalid file object provided.');
    }

    const { path, mimetype } = file;

    try {
        if (mimetype === 'application/pdf') {
            // Dynamically import 'fs/promises' only when needed.
            const fs = await import('fs/promises');
            const dataBuffer = await fs.readFile(path);
            const pdf = (await import('pdf-parse')).default;
            const data = await pdf(dataBuffer);
            return data.text;
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const { value } = await mammoth.extractRawText({ path });
            return value;
        } else if (mimetype === 'text/plain') {
            const fs = await import('fs/promises');
            const text = await fs.readFile(path, 'utf-8');
            return text;
        } else {
            console.warn(`Unsupported file type: ${mimetype}. Returning empty string.`);
            return '';
        }
    } catch (error) {
        console.error(`Error processing file ${path}:`, error);
        throw new Error(`Failed to extract text from file. Please ensure it is not corrupted.`);
    }
}
