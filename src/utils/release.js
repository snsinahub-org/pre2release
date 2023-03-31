'use strict';

const { Octokit } = require("@octokit/rest");
const github = require('@actions/github');
const fs = require('fs');


module.exports = class Releases {
    constructor(token) {
        this.token = token;
        this.ops = {
            auth: this.token
        }
        this.octokit = new Octokit(this.ops);
    }

    releaseData(data) {
        this.data = data
        this.id = data['data']['id']
        console.log('ID: ', this.id)
    }

    async uploadFiles(owner, repo, assets) {
        let files = assets.split('\n')
        for(let i = 0; i < files.length; i++) {
            console.log("FILE: ", files[i])
            await this.uploadAsset(owner, repo, files[i]);
        }
    }

    async uploadAsset(owner, repo, file) {
        return await this.octokit.rest.repos.uploadReleaseAsset({
            owner: owner,
            repo: repo,
            release_id: this.id,
            name: file,
            data: await fs.promises.readFile(file),
          });
    }

    async createRelease(owner, repo, tagName, branch, prerelease, body) {
                
        return await this.octokit.rest.repos.createRelease({
            owner: owner,
            repo: repo,
            tag_name: tagName,
            name: tagName,
            target_commitish: branch,
            body: body,
            prerelease: (prerelease == 'no' ? false: true) ,
            body: body,
        })
    }
}