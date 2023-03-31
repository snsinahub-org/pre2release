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

    console.log("JSON OBJECT: ", JSON.stringify(jsonUtils.jsonObj, '', 2))
    console.log("---------------------------------------------------------------------")
    console.log("tagsObj OBJECT: ", JSON.stringify(tagsObj, '', 2))
    console.log("---------------------------------------------------------------------")
    console.log("First TAG: ", JSON.stringify(tagsObj[0], '', 2))
    let prereleaseIsNewest = release.compareReleases(tagsObj[0], jsonUtils.jsonObj[0], prefix)
    
    if(jsonUtils.jsonObj.length > 0 && prereleaseIsNewest == true){
        latestVersion = jsonUtils.firstItem('tagName');
        let idObject = await release.getReleaseID(owner, repo, latestVersion)
        let latestRelease = await release.updateReleaseToLatest(owner, repo, idObject)
        console.log("ID", JSON.stringify(latestRelease, '', 2))

        // newVersion = jsonUtils.upgradeVersion(latestVersion, type, prefix);


    } else {
        latestVersion = "No release found";
    }

   


    fs.appendFileSync(process.env.GITHUB_OUTPUT, "version=" + latestVersion);
    const octokit = github.getOctokit(myToken);
}

run();