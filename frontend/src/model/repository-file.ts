import m from 'mithril';
import global from '../global';

const fixtures = {
  "dce.go": {"path":"dce.go","content":"// Copyright 2016 Google Inc.  All rights reserved.\n// Use of this source code is governed by a BSD-style\n// license that can be found in the LICENSE file.\n\npackage uuid\n\nimport (\n\t\"encoding/binary\"\n\t\"fmt\"\n\t\"os\"\n)\n\n// A Domain represents a Version 2 domain\ntype Domain byte\n\n// Domain constants for DCE Security (Version 2) UUIDs.\nconst (\n\tPerson = Domain(0)\n\tGroup  = Domain(1)\n\tOrg    = Domain(2)\n)\n\n// NewDCESecurity returns a DCE Security (Version 2) UUID.\n//\n// The domain should be one of Person, Group or Org.\n// On a POSIX system the id should be the users UID for the Person\n// domain and the users GID for the Group.  The meaning of id for\n// the domain Org or on non-POSIX systems is site defined.\n//\n// For a given domain/id pair the same token may be returned for up to\n// 7 minutes and 10 seconds.\nfunc NewDCESecurity(domain Domain, id uint32) (UUID, error) {\n\tuuid, err := NewUUID()\n\tif err == nil {\n\t\tuuid[6] = (uuid[6] \u0026 0x0f) | 0x20 // Version 2\n\t\tuuid[9] = byte(domain)\n\t\tbinary.BigEndian.PutUint32(uuid[0:], id)\n\t}\n\treturn uuid, err\n}\n\n// NewDCEPerson returns a DCE Security (Version 2) UUID in the person\n// domain with the id returned by os.Getuid.\n//\n//  NewDCESecurity(Person, uint32(os.Getuid()))\nfunc NewDCEPerson() (UUID, error) {\n\treturn NewDCESecurity(Person, uint32(os.Getuid()))\n}\n\n// NewDCEGroup returns a DCE Security (Version 2) UUID in the group\n// domain with the id returned by os.Getgid.\n//\n//  NewDCESecurity(Group, uint32(os.Getgid()))\nfunc NewDCEGroup() (UUID, error) {\n\treturn NewDCESecurity(Group, uint32(os.Getgid()))\n}\n\n// Domain returns the domain for a Version 2 UUID.  Domains are only defined\n// for Version 2 UUIDs.\nfunc (uuid UUID) Domain() Domain {\n\treturn Domain(uuid[9])\n}\n\n// ID returns the id for a Version 2 UUID. IDs are only defined for Version 2\n// UUIDs.\nfunc (uuid UUID) ID() uint32 {\n\treturn binary.BigEndian.Uint32(uuid[0:4])\n}\n\nfunc (d Domain) String() string {\n\tswitch d {\n\tcase Person:\n\t\treturn \"Person\"\n\tcase Group:\n\t\treturn \"Group\"\n\tcase Org:\n\t\treturn \"Org\"\n\t}\n\treturn fmt.Sprintf(\"Domain%d\", int(d))\n}\n"},
  ":-(": {"path":"","content":":-("}
};

class RepositoryFile {
  content: string = '';
  path: string = '';

  constructor(file: RepositoryFile) {
    this.content = file.content;
    this.path = file.path;
  }

  static load(owner: string, name: string, path: string): Promise<RepositoryFile> {
    if (global.debug) {
      return new Promise<RepositoryFile>((resolve) => {
        setTimeout(() => {
          resolve(fixtures['dce.go']);
        }, 1000);
      }).then(result => result as RepositoryFile);
    } else {
      return m.request({
        method: 'GET',
        url: `/api/${owner}/${name}/info/${path}`
      }).then(result => result as RepositoryFile)
    }
  }
}

export default RepositoryFile;
