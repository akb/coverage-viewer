export interface ProjectCoverage {
  files: FileCoverage[];
}

export interface FileCoverage {
	fileName: string;
	coverageBlocks: CoverageBlock[];
}

export interface CoverageBlock {
  startLine: number;
	endLine: number;
}
