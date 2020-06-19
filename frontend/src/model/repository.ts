import m from 'mithril';

import global from '../global';

const fixtures = {
  "google/uuid": {"owner":"google","name":"uuid","stars":1928,"files":[".travis.yml","CONTRIBUTING.md","CONTRIBUTORS","LICENSE","README.md","dce.go","doc.go","go.mod","hash.go","json_test.go","marshal.go","node.go","node_js.go","node_net.go","seq_test.go","sql.go","sql_test.go","time.go","util.go","uuid.go","uuid_test.go","version1.go","version4.go"]}
};

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

class Repository {
  owner: string = '';
  name: string = '';
  stars: number = 0;
  files: string[] = [];
  coverage?: ProjectCoverage;

  static load(owner: string, name: string) {
    if (global.debug) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fixtures['google/uuid']);
        }, 1000);
      }).then(result => result as Repository);
    } else {
      return m.request({
        method: 'GET',
        url: `/api/${owner}/${name}/info`
      }).then(result => result as Repository);
    }
  }

  constructor(repository: Repository) {
    this.owner = repository.owner;
    this.name = repository.name;
    this.stars = repository.stars;
    this.files = repository.files;
  }

  runTests() {
    return m.request({
      method: 'POST',
      url: `/api/${this.owner}/${this.name}/test`
    }).then(coverage => {
      this.coverage = coverage as ProjectCoverage;
    });
  }
}

export default Repository;
