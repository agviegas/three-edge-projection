import { searchForWorkspaceRoot } from 'vite';
import fs from 'fs';
import path from 'path';

// Recursively find all HTML files in a directory
function findHtmlFiles(dir, fileList = []) {
	const files = fs.readdirSync(dir);
	
	files.forEach(file => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		
		if (stat.isDirectory()) {
			findHtmlFiles(filePath, fileList);
		} else if (/\.html$/.test(file)) {
			fileList.push(filePath);
		}
	});
	
	return fileList;
}

export default {

	root: './example/',
	base: '',
	optimizeDeps: {
		esbuildOptions: {
			target: 'es2022',
		},
	},
	build: {
		target: 'es2022',
		sourcemap: true,
		outDir: './dist/',
		minify: false,
		terserOptions: {
			compress: false,
			mangle: false,
		},
		rollupOptions: {
			input: findHtmlFiles('./example/')
				.map( p => p.replace(/\\/g, '/') ), // Normalize path separators for cross-platform compatibility
		},
	},
	server: {
		fs: {
			allow: [
				// search up for workspace root
				searchForWorkspaceRoot( process.cwd() ),
			],
		},
	}

};
