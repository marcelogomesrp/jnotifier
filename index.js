#!/usr/bin/env node


const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const conf = require('./conf.json');

function main() {
    //console.log(JSON.stringify(conf));
    console.log("***********************************");
    console.log(`I have ${conf.sources.length} sources dir`);
    console.log("***********************************");
    conf.sources.forEach(source => {
        //console.log(`Job: ${JSON.stringify(job)}`);
        console.log(`JobName: ${source.jobname} with ${source.rules.length} rules`);
        const runs = getAllRuns(source.src);
        console.log(`Runs ret:::: ${runs}`);
        source.rules.forEach(rule => {
            if (isRuleCandidate(rule)) {
                console.log(`\truninng rule: ${rule.name}`);
                runs.forEach( run => {
                    rule.files.forEach(file => {
                        console.log(`\t\tIn RUN ${run} to check: ${file.filename}`);
                        console.log(`\t\tIn RUN ${run} file content: ${file.fileContent}`);
                        console.log(" ");
                    });
                });
                //console.log(`\tFile skip: ${rule.fileSkip}`);
            }
        })

    })
    if (fs.existsSync("./teste")) {
        console.log("Sim teste");
    }

}

function getAllRuns(src) {
    let runs = [];
    console.log(`********* ${src}`);
    fs.readdirSync(src).forEach(file => {
        if (fs.lstatSync(path.resolve(src, file)).isDirectory()) {
            console.log(`file.... ${file}`);
            runs.push(file);
        }
    });
    return runs;
}

function getAllValidRuns(src) {
    let runs = [];
    console.log(`********* ${src}`);
    fs.readdirSync(src).forEach(file => {
        if (fs.lstatSync(path.resolve(src, file)).isDirectory()) {
            if(isRuleCandidate(rule, file))
            runs.push(file);
        }
    });
    return runs;
}


//TODO: colocar toda a validação aqui, incluindo a questão de olhar os arquivos que devem existir (exemplo copyCompleted)

function isRuleCandidate(rule) {
    if (rule.fileSkip) {
        return fs.existsSync(rule.fileSkip);
    }
    return false;
}

function isRuleCandidate(rule, file) {
    console.log(`running isRuleCandidate`);
    if (rule.fileSkip) {
        return fs.existsSync(rule.fileSkip);
    }
    return false;
}



function callJenkins(run) {
    console.log(`Call Jenkins to run ${run}`);
}
    //    var jenkins = jenkinsapi.init('http://user:hash@localhost:8080');
    //
    //    jenkins.build('tst1', function(err, data) {
    //        if (err){ return console.log(`Ops: Error \n ${err}`); }
    //        console.log(`It's ok ${data}`);
    //      });
    //
    //curl -X POST http://localhost:8080/job/tst1/build --user user:hash;


function runAsDaemon() {
    console.log(`Running at ${conf.cron}`)
    let task = cron.schedule(conf.cron, () => {
        console.log('stoped task');
        main();
    }, {
        scheduled: false
    });

    task.start();
}

main();
//runAsDaemon();


