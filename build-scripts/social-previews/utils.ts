import fs from "fs";
import path from "path";

export function ensureDirectoryExistence(filePath: string) {
	const localDirname = path.dirname(filePath);
	fs.mkdirSync(localDirname, { recursive: true });
}
