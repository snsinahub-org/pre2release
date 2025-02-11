const github = require('@actions/github');
const core = require('@actions/core');
const fs = require('fs');
const { graphql } = require("@octokit/graphql");
const getTags = require('./utils/get-tags.js');
const JsonUtils = require('./utils/json-utils.js');
const Release = require('./utils/release.js');
const { json } = require('stream/consumers');

async function run() {
    // Inputs
    const myToken = core.getInput('token');
    let prefix = core.getInput('prefix');
    const prerelease = core.getInput('prerelease');
    const REQUIRE_PRERELEASE = core.getInput('REQUIRE_PRERELEASE');
    const repoFull = core.getInput('repo').split('/');
    const tags = new getTags();
    let owner = repoFull[0];
    let repo = repoFull[1]
    let startsWith = core.getInput('starts-with');


    const release = new Release(myToken);    
    
    const repository = await tags.getAllTags(owner, repo, myToken, prerelease);
    let tagsObj = tags.getTags(repository);
    const jsonUtils = new JsonUtils(tagsObj);    
    
    if(startsWith.trim() ==  '') {       
        if(prefix == '') {
            console.log("no prefix")
            jsonUtils.filterNoPrefix()
        } else {
            console.log("prefix: ", prefix)
            jsonUtils.filterByPrefix(prefix);
        }
    }
    

    let newVersion = '';
    let latestVersion =  ''

    
    
    

    if(startsWith.trim() != '') {
        prefix = '';
        jsonUtils.filterByStartsWith(startsWith);
    } 

    

    let prereleaseIsNewest = false

    if(tagsObj.length > 0 && jsonUtils.jsonObj.length > 0) {        
        let prereleaseIsNewest = release.compareReleases(tagsObj[0], jsonUtils.jsonObj[0], prefix)
    } 
    
    
    if(jsonUtils.jsonObj.length > 0 && prereleaseIsNewest != true){        
        latestVersion = jsonUtils.firstItem('tagName', prerelease);
        let idObject = await release.getReleaseID(owner, repo, latestVersion)
        let latestRelease = await release.updateReleaseToLatest(owner, repo, idObject) 
    } else if(REQUIRE_PRERELEASE == 'false' && prereleaseIsNewest == false && jsonUtils.jsonObj.length > 0) {        
        latestVersion = jsonUtils.firstItem('tagName', prerelease);
    } else {        
        fs.appendFileSync(process.env.GITHUB_OUTPUT, "version=" + 'Error: No release found');        
    }

    console.log("TAG: ", latestVersion)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, "version=" + latestVersion);
    const octokit = github.getOctokit(myToken);
}

run();