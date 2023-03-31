const github = require('@actions/github');
const core = require('@actions/core');
const fs = require('fs');
const { graphql } = require("@octokit/graphql");
const getTags = require('./utils/get-tags.js');
const JsonUtils = require('./utils/json-utils.js');
const Release = require('./utils/release.js');

async function run() {
    // Inputs
    const myToken = core.getInput('token');
    const prefix = core.getInput('prefix');
    const prerelease = core.getInput('prerelease');
    const repoFull = core.getInput('repo').split('/');
    const tags = new getTags();
    let owner = repoFull[0];
    let repo = repoFull[1]




    // class initializations
    const release = new Release(myToken);    
    
    
    
    const { repository } = await tags.getAllTags(owner, repo, myToken);
    
    let tagsObj = tags.getTags(repository);
    const jsonUtils = new JsonUtils(tagsObj); 

    if(prefix == '') {
        jsonUtils.filterNoPrefix()
    } else {
        jsonUtils.filterByPrefix(prefix);
    } 

    let newVersion = '';
    let latestVersion =  ''
    
    if(jsonUtils.jsonObj.length > 0 && !exitOnMissingType){
        latestVersion = jsonUtils.firstItem('tagName');
        // newVersion = jsonUtils.upgradeVersion(latestVersion, type, prefix);


    } else {
        newVersion = `${prefix}1.0.0`;
    }

   


    fs.appendFileSync(process.env.GITHUB_OUTPUT, "version=" + latestVersion);
    const octokit = github.getOctokit(myToken);
}

run();