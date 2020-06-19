import m from 'mithril';

import global from '../global';
import {Line} from '../highlight';
import {ProjectCoverage, CoverageBlock} from '../model/coverage';

const fixtures = {
  "google/uuid": {"owner":"google","name":"uuid","stars":1928,"files":[".travis.yml","CONTRIBUTING.md","CONTRIBUTORS","LICENSE","README.md","dce.go","doc.go","go.mod","hash.go","json_test.go","marshal.go","node.go","node_js.go","node_net.go","seq_test.go","sql.go","sql_test.go","time.go","util.go","uuid.go","uuid_test.go","version1.go","version4.go"]}
};

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
      return this.coverage;
    });
  }

  coverageForFile(path: string): Line[] {
    let lines: Line[] = [];
    if (!this.coverage) return lines;
    const filePath = `github.com/${this.owner}/${this.name}/${path}`;
    for (const file of this.coverage.files) {
      if (file.fileName === filePath) {
        lines = file.coverageBlocks.map((c: CoverageBlock) => {
          return {start: c.startLine-1, end: c.endLine-1, color: 'rgb(239, 254, 232)'};
        });
        break;
      }
    }
    return lines;
  }
}

export default Repository;
