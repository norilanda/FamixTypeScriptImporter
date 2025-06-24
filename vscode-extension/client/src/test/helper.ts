import * as path from 'path';
import * as fs from 'fs';

export class TestHelper {
  static getExtensionId(): string {
	const packageJsonPath = path.join(__dirname, '../../..', 'package.json');
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	const extensionName = packageJson.name;
	const publisher = packageJson.publisher || 'undefined_publisher';
	return `${publisher}.${extensionName}`;
  }
}
