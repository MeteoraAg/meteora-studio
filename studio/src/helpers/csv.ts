import fs from 'fs';
import { parse } from 'csv-parse';

export async function parseCsv<T>(filePath: string): Promise<Array<T>> {
  const fileStream = fs.createReadStream(filePath);

  return new Promise((resolve, reject) => {
    const parser = parse({
      columns: true, // Use the header row as keys
      skip_empty_lines: true, // Skip empty lines
    });

    const results: T[] = [];

    fileStream
      .pipe(parser)
      .on('data', (row: T) => results.push(row)) // Collect rows
      .on('end', () => resolve(results)) // Resolve the promise with results
      .on('error', (err) => reject(err)); // Reject the promise if error occurs
  });
}
